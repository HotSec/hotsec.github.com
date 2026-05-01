import os
import hashlib
import json
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import time
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['TEMP_FOLDER'] = 'temp'
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size

# 确保目录存在
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['TEMP_FOLDER'], exist_ok=True)

# 存储上传进度信息
upload_progress = {}

def calculate_file_hash(file_path):
    """计算文件的MD5哈希值"""
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def get_chunk_filename(file_hash, chunk_index):
    """获取分块文件名"""
    return f"{file_hash}_{chunk_index}.part"

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/check', methods=['POST'])
def check_file():
    """检查文件上传状态"""
    data = request.get_json()
    file_hash = data.get('fileHash')
    total_chunks = data.get('totalChunks')
    filename = data.get('filename')
    
    # 检查文件是否已完整上传
    final_file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if os.path.exists(final_file_path):
        return jsonify({
            'status': 'completed',
            'message': '文件已存在'
        })
    
    # 检查已上传的分块
    uploaded_chunks = []
    for i in range(total_chunks):
        chunk_filename = get_chunk_filename(file_hash, i)
        chunk_path = os.path.join(app.config['TEMP_FOLDER'], chunk_filename)
        if os.path.exists(chunk_path):
            uploaded_chunks.append(i)
    
    return jsonify({
        'status': 'resume',
        'uploadedChunks': uploaded_chunks,
        'fileHash': file_hash
    })

@app.route('/upload', methods=['POST'])
def upload_chunk():
    """上传文件分块"""
    try:
        chunk_index = int(request.form.get('chunkIndex'))
        total_chunks = int(request.form.get('totalChunks'))
        file_hash = request.form.get('fileHash')
        filename = secure_filename(request.form.get('filename'))
        
        # 获取上传的文件
        file = request.files['file']
        
        # 保存分块文件
        chunk_filename = get_chunk_filename(file_hash, chunk_index)
        chunk_path = os.path.join(app.config['TEMP_FOLDER'], chunk_filename)
        file.save(chunk_path)
        
        # 更新上传进度
        progress_key = f"{file_hash}_{filename}"
        if progress_key not in upload_progress:
            upload_progress[progress_key] = {
                'uploadedChunks': set(),
                'startTime': time.time(),
                'filename': filename
            }
        
        upload_progress[progress_key]['uploadedChunks'].add(chunk_index)
        
        # 计算进度百分比
        progress = len(upload_progress[progress_key]['uploadedChunks']) / total_chunks * 100
        
        return jsonify({
            'status': 'success',
            'chunkIndex': chunk_index,
            'progress': round(progress, 2)
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/merge', methods=['POST'])
def merge_chunks():
    """合并所有分块为完整文件"""
    try:
        data = request.get_json()
        file_hash = data.get('fileHash')
        total_chunks = data.get('totalChunks')
        filename = secure_filename(data.get('filename'))
        
        final_file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # 检查是否所有分块都已上传
        for i in range(total_chunks):
            chunk_filename = get_chunk_filename(file_hash, i)
            chunk_path = os.path.join(app.config['TEMP_FOLDER'], chunk_filename)
            if not os.path.exists(chunk_path):
                return jsonify({
                    'status': 'error',
                    'message': f'分块 {i} 缺失'
            }), 400
        
        # 合并文件
        with open(final_file_path, 'wb') as output_file:
            for i in range(total_chunks):
                chunk_filename = get_chunk_filename(file_hash, i)
                chunk_path = os.path.join(app.config['TEMP_FOLDER'], chunk_filename)
                
                with open(chunk_path, 'rb') as chunk_file:
                    output_file.write(chunk_file.read())
                
                # 删除临时分块文件
                os.remove(chunk_path)
        
        # 清理进度信息
        progress_key = f"{file_hash}_{filename}"
        if progress_key in upload_progress:
            del upload_progress[progress_key]
        
        return jsonify({
            'status': 'success',
            'message': '文件合并完成',
            'filePath': final_file_path
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/progress/<file_hash>/<filename>')
def get_upload_progress(file_hash, filename):
    """获取上传进度"""
    progress_key = f"{file_hash}_{filename}"
    if progress_key in upload_progress:
        uploaded_count = len(upload_progress[progress_key]['uploadedChunks'])
        total_chunks = request.args.get('totalChunks', type=int)
        if total_chunks:
            progress = uploaded_count / total_chunks * 100
            return jsonify({
                'progress': round(progress, 2),
                'uploadedChunks': uploaded_count,
                'totalChunks': total_chunks
            })
    
    return jsonify({
        'progress': 0,
        'uploadedChunks': 0,
        'totalChunks': total_chunks or 0
    })

@app.route('/files')
def list_files():
    """列出所有已上传的文件"""
    files = []
    for filename in os.listdir(app.config['UPLOAD_FOLDER']):
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if os.path.isfile(file_path):
            stat = os.stat(file_path)
            files.append({
                'name': filename,
                'size': stat.st_size,
                'uploadTime': datetime.fromtimestamp(stat.st_ctime).strftime('%Y-%m-%d %H:%M:%S')
            })
    
    return jsonify({'files': files})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)