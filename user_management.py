from flask import Flask, render_template, jsonify, request, redirect, url_for, session
import base64



def set_up(app):
    user_pwd = {}
    with open("./static/data/users.txt") as myfile:
        for line in myfile:
            user, pwd = line[:-1].partition("=")[::2]
            #a = base64.b64encode(bytes(pwd, 'utf-8'))
            user_pwd[user.strip()] = base64.b64decode(pwd).decode("utf-8", "ignore")


    @app.route('/login', methods=['GET', 'POST'])
    def login():
        if 'GET' == request.method:
            return app.send_static_file('login.html')
        elif 'POST' == request.method:
            username = request.form['username']
            password = request.form['password']


            if username in user_pwd.keys() and password == user_pwd[username] :
                session['username'] = username
                return redirect(url_for('index'))
            else :
                return redirect(url_for('login'))
        return redirect(url_for('login'))

    @app.route('/logout')
    def logout():
        session.pop('username', None)
        return redirect(url_for('login'))
