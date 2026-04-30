class FileUploader {
    constructor() {
        this.chunkSize = 2 * 1024 * 1024; // 2MB 分块大小
        this.uploadingFiles = new Map();
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadFileList();
    }

    bindEvents() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        // 点击选择文件
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // 文件选择变化
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // 拖放事件
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            this.handleFiles(e.dataTransfer.files);
        });
    }

    async handleFiles(files) {
        for (let file of files) {
            await this.uploadFile(file);
        }
    }

    async uploadFile(file) {
        const fileHash = await this.calculateFileHash(file);
        const totalChunks = Math.ceil(file.size / this.chunkSize);

        // 检查文件状态
        const checkResponse = await this.checkFileStatus(file, fileHash, totalChunks);
        
        if (checkResponse.status === 'completed') {
            this.showNotification('文件已存在，无需重复上传', 'info');
            return;
        }

        // 创建上传进度显示
        this.createProgressDisplay(file, fileHash);

        // 上传分块
        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            // 如果分块已上传，跳过
            if (checkResponse.uploadedChunks && checkResponse.uploadedChunks.includes(chunkIndex)) {
                this.updateProgress(fileHash, chunkIndex, totalChunks);
                continue;
            }

            const chunk = file.slice(
                chunkIndex * this.chunkSize,
                Math.min((chunkIndex + 1) * this.chunkSize, file.size)
            );

            await this.uploadChunk(file, fileHash, chunkIndex, totalChunks, chunk);
        }

        // 合并文件
        await this.mergeFile(file, fileHash, totalChunks);
    }

    async checkFileStatus(file, fileHash, totalChunks) {
        const response = await fetch('/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fileHash: fileHash,
                totalChunks: totalChunks,
                filename: file.name
            })
        });

        return await response.json();
    }

    async uploadChunk(file, fileHash, chunkIndex, totalChunks, chunk) {
        const formData = new FormData();
        formData.append('file', chunk);
        formData.append('chunkIndex', chunkIndex);
        formData.append('totalChunks', totalChunks);
        formData.append('fileHash', fileHash);
        formData.append('filename', file.name);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.status === 'success') {
                this.updateProgress(fileHash, chunkIndex, totalChunks);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error(`分块 ${chunkIndex} 上传失败:`, error);
            // 可以添加重试逻辑
        }
    }

    async mergeFile(file, fileHash, totalChunks) {
        const response = await fetch('/merge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fileHash: fileHash,
                totalChunks: totalChunks,
                filename: file.name
            })
        });

        const result = await response.json();
        
        if (result.status === 'success') {
            this.showNotification(`文件 "${file.name}" 上传完成`, 'success');
            this.updateFileCard(fileHash, 'completed');
            this.loadFileList();
        } else {
            this.showNotification(`文件合并失败: ${result.message}`, 'error');
        }
    }

    createProgressDisplay(file, fileHash) {
        const progressSection = document.getElementById('progressSection');
        const progressContainer = document.getElementById('progressContainer');

        const progressItem = document.createElement('div');
        progressItem.id = `progress-${fileHash}`;
        progressItem.className = 'bg-white rounded-lg shadow-sm p-4';
        progressItem.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <span class="font-medium text-gray-800">${file.name}</span>
                <span class="text-sm text-gray-500 progress-text">0%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
                    <div class="progress-bar bg-blue-500 h-3 rounded-full" style="width: 0%"></div>
            </div>
        `;

        progressContainer.appendChild(progressItem);
        progressSection.classList.remove('hidden');

        this.uploadingFiles.set(fileHash, {
            file: file,
            progress: 0,
            uploadedChunks: new Set()
        });
    }

    updateProgress(fileHash, chunkIndex, totalChunks) {
        const progressItem = document.getElementById(`progress-${fileHash}`);
        if (!progressItem) return;

        const fileInfo = this.uploadingFiles.get(fileHash);
        fileInfo.uploadedChunks.add(chunkIndex);
        
        const progress = (fileInfo.uploadedChunks.size / totalChunks) * 100;
        fileInfo.progress = progress;

        const progressBar = progressItem.querySelector('.progress-bar');
        const progressText = progressItem.querySelector('.progress-text');

        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;

        // 更新进度显示颜色
        if (progress >= 100) {
            progressBar.classList.remove('bg-blue-500');
            progressBar.classList.add('bg-green-500');
        progressText.classList.remove('text-gray-500');
            progressText.classList.add('text-green-600');
        }
    }

    updateFileCard(fileHash, status) {
        const progressItem = document.getElementById(`progress-${fileHash}`);
        if (progressItem) {
            setTimeout(() => {
                progressItem.remove();
                this.uploadingFiles.delete(fileHash);
                
                // 如果没有正在上传的文件，隐藏进度区域
                if (this.uploadingFiles.size === 0) {
                    document.getElementById('progressSection').classList.add('hidden');
                }
            }, 2000);
        }
    }

    async calculateFileHash(file) {
        return new Promise((resolve, reject) => {
            const chunkSize = 2 * 1024 * 1024;
            const chunks = Math.ceil(file.size / chunkSize);
            let currentChunk = 0;
            const spark = new SparkMD5.ArrayBuffer(); // 使用 SparkMD5 库

            function readNextChunk() {
                const start = currentChunk * chunkSize;
                const end = Math.min(start + chunkSize, file.size);
                const chunk = file.slice(start, end);

                const reader = new FileReader();
                reader.onload = (e) => {
                    spark.append(e.target.result);
                    currentChunk++;

                    if (currentChunk < chunks) {
                        readNextChunk();
                    } else {
                        resolve(spark.end());
                    }
                };
                reader.onerror = () => {
                    reject(new Error('文件读取失败'));
                };
                reader.readAsArrayBuffer(chunk);
            }

            readNextChunk();
        });
    }

    async loadFileList() {
        const response = await fetch('/files');
        const result = await response.json();

        const fileList = document.getElementById('fileList');
        fileList.innerHTML = '';

        result.files.forEach(fileInfo => {
            const fileCard = this.createFileCard(fileInfo);
            fileList.appendChild(fileCard);
        });
    }

    createFileCard(fileInfo) {
        const template = document.getElementById('fileCardTemplate');
        const clone = template.content.cloneNode(true);

        const fileName = clone.querySelector('.file-name');
        const fileInfoDiv = clone.querySelector('.file-info');

        fileName.textContent = fileInfo.name;
        fileInfoDiv.textContent = `${this.formatFileSize(fileInfo.size)} - ${fileInfo.uploadTime}`;

        return clone;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
    }

    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg transform transition-transform duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // 3秒后自动移除
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// 简化版文件哈希计算
async function calculateFileHash(file) {
    const chunkSize = 2 * 1024 * 1024;
    const chunks = Math.ceil(file.size / chunkSize);
    let hash = '';

    for (let i = 0; i < chunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        
        const reader = new FileReader();
        const chunkData = await new Promise((resolve) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsArrayBuffer(chunk);
        }

        const chunkArray = new Uint8Array(chunkData);
        let chunkHash = 0;
        for (let j = 0; j < chunkArray.length; j++) {
            chunkHash = ((chunkHash << 5) - chunkHash) + chunkArray[j];
            chunkHash |= 0; // 转换为32位整数
        }
        hash += chunkHash.toString(16);
    }

    return hash;
}

// 初始化上传器
document.addEventListener('DOMContentLoaded', () => {
    new FileUploader();
});class FileUploader {
    constructor() {
        this.chunkSize = 2 * 1024 * 1024; // 2MB 分块大小
        this.uploadingFiles = new Map();
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadFileList();
    }

    bindEvents() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        // 点击选择文件
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // 文件选择变化
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // 拖放事件
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            this.handleFiles(e.dataTransfer.files);
        });
    }

    async handleFiles(files) {
        for (let file of files) {
            await this.uploadFile(file);
        }
    }

    async uploadFile(file) {
        const fileHash = await this.calculateFileHash(file);
        const totalChunks = Math.ceil(file.size / this.chunkSize);

        // 检查文件状态
        const checkResponse = await this.checkFileStatus(file, fileHash, totalChunks);
        
        if (checkResponse.status === 'completed') {
            this.showNotification('文件已存在，无需重复上传', 'info');
            return;
        }

        // 创建上传进度显示
        this.createProgressDisplay(file, fileHash);

        // 上传分块
        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            // 如果分块已上传，跳过
            if (checkResponse.uploadedChunks && checkResponse.uploadedChunks.includes(chunkIndex)) {
                this.updateProgress(fileHash, chunkIndex, totalChunks);
                continue;
            }

            const chunk = file.slice(
                chunkIndex * this.chunkSize,
                Math.min((chunkIndex + 1) * this.chunkSize, file.size)
            );

            await this.uploadChunk(file, fileHash, chunkIndex, totalChunks, chunk);
        }

        // 合并文件
        await this.mergeFile(file, fileHash, totalChunks);
    }

    async checkFileStatus(file, fileHash, totalChunks) {
        const response = await fetch('/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fileHash: fileHash,
                totalChunks: totalChunks,
                filename: file.name
            })
        });

        return await response.json();
    }

    async uploadChunk(file, fileHash, chunkIndex, totalChunks, chunk) {
        const formData = new FormData();
        formData.append('file', chunk);
        formData.append('chunkIndex', chunkIndex);
        formData.append('totalChunks', totalChunks);
        formData.append('fileHash', fileHash);
        formData.append('filename', file.name);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.status === 'success') {
                this.updateProgress(fileHash, chunkIndex, totalChunks);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error(`分块 ${chunkIndex} 上传失败:`, error);
            // 可以添加重试逻辑
        }
    }

    async mergeFile(file, fileHash, totalChunks) {
        const response = await fetch('/merge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fileHash: fileHash,
                totalChunks: totalChunks,
                filename: file.name
            })
        });

        const result = await response.json();
        
        if (result.status === 'success') {
            this.showNotification(`文件 "${file.name}" 上传完成`, 'success');
            this.updateFileCard(fileHash, 'completed');
            this.loadFileList();
        } else {
            this.showNotification(`文件合并失败: ${result.message}`, 'error');
        }
    }

    createProgressDisplay(file, fileHash) {
        const progressSection = document.getElementById('progressSection');
        const progressContainer = document.getElementById('progressContainer');

        const progressItem = document.createElement('div');
        progressItem.id = `progress-${fileHash}`;
        progressItem.className = 'bg-white rounded-lg shadow-sm p-4';
        progressItem.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <span class="font-medium text-gray-800">${file.name}</span>
                <span class="text-sm text-gray-500 progress-text">0%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
                    <div class="progress-bar bg-blue-500 h-3 rounded-full" style="width: 0%"></div>
            </div>
        `;

        progressContainer.appendChild(progressItem);
        progressSection.classList.remove('hidden');

        this.uploadingFiles.set(fileHash, {
            file: file,
            progress: 0,
            uploadedChunks: new Set()
        });
    }

    updateProgress(fileHash, chunkIndex, totalChunks) {
        const progressItem = document.getElementById(`progress-${fileHash}`);
        if (!progressItem) return;

        const fileInfo = this.uploadingFiles.get(fileHash);
        fileInfo.uploadedChunks.add(chunkIndex);
        
        const progress = (fileInfo.uploadedChunks.size / totalChunks) * 100;
        fileInfo.progress = progress;

        const progressBar = progressItem.querySelector('.progress-bar');
        const progressText = progressItem.querySelector('.progress-text');

        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;

        // 更新进度显示颜色
        if (progress >= 100) {
            progressBar.classList.remove('bg-blue-500');
            progressBar.classList.add('bg-green-500');
        progressText.classList.remove('text-gray-500');
            progressText.classList.add('text-green-600');
        }
    }

    updateFileCard(fileHash, status) {
        const progressItem = document.getElementById(`progress-${fileHash}`);
        if (progressItem) {
            setTimeout(() => {
                progressItem.remove();
                this.uploadingFiles.delete(fileHash);
                
                // 如果没有正在上传的文件，隐藏进度区域
                if (this.uploadingFiles.size === 0) {
                    document.getElementById('progressSection').classList.add('hidden');
            }, 2000);
        }
    }

    async calculateFileHash(file) {
        return new Promise((resolve) => {
            const chunkSize = 2 * 1024 * 1024;
            const chunks = Math.ceil(file.size / chunkSize);
            let currentChunk = 0;
            const hash = hashlib.md5();

            function readNextChunk() {
                const start = currentChunk * chunkSize;
                const end = Math.min(start + chunkSize, file.size);
            const chunk = file.slice(start, end);

            const reader = new FileReader();
            reader.onload = (e) => {
                hash.update(new Uint8Array(e.target.result));
                currentChunk++;

                if (currentChunk < chunks) {
                    readNextChunk();
                } else {
                    resolve(hash.digest('hex'));
                }
            };

            readNextChunk();
        });
    }

    async loadFileList() {
        const response = await fetch('/files');
        const result = await response.json();

        const fileList = document.getElementById('fileList');
        fileList.innerHTML = '';

        result.files.forEach(fileInfo => {
            const fileCard = this.createFileCard(fileInfo);
            fileList.appendChild(fileCard);
        });
    }

    createFileCard(fileInfo) {
        const template = document.getElementById('fileCardTemplate');
        const clone = template.content.cloneNode(true);

        const fileName = clone.querySelector('.file-name');
        const fileInfoDiv = clone.querySelector('.file-info');

        fileName.textContent = fileInfo.name;
        fileInfoDiv.textContent = `${this.formatFileSize(fileInfo.size)} - ${fileInfo.uploadTime}`;

        return clone;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
    }

    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg transform transition-transform duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // 3秒后自动移除
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// 简化版文件哈希计算
async function calculateFileHash(file) {
    const chunkSize = 2 * 1024 * 1024;
    const chunks = Math.ceil(file.size / chunkSize);
    let hash = '';

    for (let i = 0; i < chunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        
        const reader = new FileReader();
        const chunkData = await new Promise((resolve) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsArrayBuffer(chunk);
        }

        const chunkArray = new Uint8Array(chunkData);
        let chunkHash = 0;
        for (let j = 0; j < chunkArray.length; j++) {
            chunkHash = ((chunkHash << 5) - chunkHash) + chunkArray[j];
            chunkHash |= 0; // 转换为32位整数
        }
        hash += chunkHash.toString(16);
    }

    return hash;
}

// 初始化上传器
document.addEventListener('DOMContentLoaded', () => {
    new FileUploader();
});