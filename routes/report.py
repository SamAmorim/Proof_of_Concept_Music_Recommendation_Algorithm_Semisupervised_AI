from flask import Blueprint, render_template, session, redirect
from services.report import get_most_listened_artists, get_most_present_features, get_metrics, get_most_present_words_in_title
from services.spotify import get_recently_played

report_bp = Blueprint('report', __name__, url_prefix='/report')

@report_bp.route('/', methods=['GET'])
def main():
    if 'user' not in session:
        return redirect('/')
    return render_template('report.html')

@report_bp.route('/data', methods=['GET'])
def data():
    recently_played = get_recently_played()

    most_listened_artists = get_most_listened_artists(recent_tracks=recently_played)
    most_present_features = get_most_present_features(recent_tracks=recently_played)
    most_present_words = get_most_present_words_in_title(recent_tracks=recently_played)

    metrics = get_metrics(recent_tracks=recently_played)
    
    return {
        'most_listened_artists': most_listened_artists,
        'most_present_words': most_present_words,
        'most_present_features': most_present_features,
        'metrics': metrics,
    }