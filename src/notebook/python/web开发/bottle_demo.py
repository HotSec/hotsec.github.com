from bottle import Bottle, template,static_file,request


app = Bottle()

@app.route("/")
@app.route("/hello")
def hello():
    return "Hello World!"

@app.route('/hello/<name>')
def index(name):
    return template('<b>Hello {{name}}</b>!', name=name)

@app.route('/show/<name:re:[1-9]+>')
def show(name):
    return name

@app.route('/static/<path:path>')
def callback(path):
    return static_file(path, ...)


@app.route('/upload', method='POST')
def do_upload():
    category   = request.forms.category
    upload     = request.files.get('upload')
    name, ext = os.path.splitext(upload.filename)
    if ext not in ('.png','.jpg','.jpeg'):
        return 'File extension not allowed.'

    save_path = get_save_path_for_category(category)
    upload.save(save_path) # appends upload.filename automatically
    return 'OK'

import asyncio

# @app.route('/async')
# async def async_route():
#     await asyncio.sleep(1)
#     return 'Async Response'


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True, reloader=True)

# http://localhost:8080/hello/World