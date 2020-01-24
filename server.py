from cfenv import AppEnv
import json
import logging
import os
from flask import (Flask, render_template, jsonify, request, 
            redirect, url_for, session)
from flask_cors import CORS

import user_management as um
import indicators_api
import forecast_api

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s %(name)-12s %(levelname)-8s %(message)s')
logger = logging.getLogger(__name__)


CONFIGURATION = 'configuration.json'
BASEYEAR = 2019

env = AppEnv()
app = Flask(env.name or __name__)
app.secret_key = "4656A742-1BAA-41B9-A618-6C61E85169B8"

CORS(app)

with open(CONFIGURATION, 'rt') as infile:
    config = json.load(infile)

# Register app end points
indicators_api.set_up(app, config)
forecast_api.set_up(app, BASEYEAR, config)

@app.route('/swagger')
def swagger_root():
    return app.send_static_file('swagger/index.html')


@app.route('/')
def index():
    if 'username' not in session:
        return redirect(url_for('login'))
    return app.send_static_file('index.html')


if __name__ == "__main__":

    app.run(host=env.bind, port=env.port)
