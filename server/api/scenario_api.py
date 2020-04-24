from flask import Flask, render_template, jsonify, request, redirect, url_for, session
import json

def set_up(app, config):

    with open(config['GROUPING'], 'rt') as infile:
        groupings = json.load(infile)

    # The scenario models are set up within the context of 
    # of the forecast model + data, i.e. Trainer object (and not here).
 
    @app.route("/scenarios")
    def groups(): # pylint: disable=W0612
        return jsonify(groupings), 200
