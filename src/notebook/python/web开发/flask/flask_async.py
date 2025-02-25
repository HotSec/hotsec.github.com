from flask import Flask, jsonify
import asyncio

app = Flask(__name__)

# 定义一个异步任务
async def async_task():
    await asyncio.sleep(2)  # 模拟一个耗时的异步操作
    return "Task completed!"

# 定义一个异步视图函数
@app.route('/async')
async def async_view():
    result = await async_task()
    return jsonify({"message": result})

# 定义一个同步视图函数作为对比
@app.route('/sync')
def sync_view():
    result = async_task_sync()
    return jsonify({"message": result})

# 同步版本的异步任务
def async_task_sync():
    asyncio.run(async_task())
    return "Task completed!"

if __name__ == '__main__':
    app.run(debug=True)
