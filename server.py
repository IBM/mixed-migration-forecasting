from cfenv import AppEnv
from flask import Flask, render_template, jsonify, request, redirect, url_for, session
from flask_cors import CORS
import user_management as um
import predict as predict

env = AppEnv()
app = Flask(env.name or __name__)
app.secret_key = "4656A742-1BAA-41B9-A618-6C61E85169B8"

CORS(app)

# Debug settings
# um.set_up(app)
# predict.set_up(app)


@app.route('/swagger')
def swagger_root():
    return app.send_static_file('swagger/index.html')


@app.route('/')
def index():
    if 'username' not in session:
        return redirect(url_for('login'))
    return app.send_static_file('index.html')


if __name__ == "__main__":
    um.set_up(app)
    predict.set_up(app, 2017)
    app.run(host=env.bind, port=env.port)
