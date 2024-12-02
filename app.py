import os
import time

from dotenv import load_dotenv
from flask import Flask, redirect, render_template, session, request

from routes import prediction, report, spotify, selection

load_dotenv(verbose=True, override=True)

def create_app():
    app = Flask(__name__)

    app.secret_key = os.environ.get('FLASK_SECRET_KEY')

    app.register_blueprint(report.report_bp)
    app.register_blueprint(spotify.spotify_bp)
    app.register_blueprint(prediction.prediction_bp)
    app.register_blueprint(selection.selection_bp)

    @app.route('/', methods=['GET'])
    def home():
        return render_template('home.html')

    return app