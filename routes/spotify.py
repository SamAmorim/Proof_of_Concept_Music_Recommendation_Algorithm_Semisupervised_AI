from flask import Blueprint, request
from services.spotify import get_recently_played, get_search, set_user_recently_played

spotify_bp = Blueprint('spotify', __name__, url_prefix='/spotify')

@spotify_bp.route('/recently-played', methods=['GET'])
def recently_played():
    return get_recently_played()

@spotify_bp.route('/search', methods=['GET'])
def search():
    search_query = request.args.get('q')
    offset = int(request.args.get('offset', 0))
    return get_search(search_query, offset)

@spotify_bp.route('/select', methods=['POST'])
def select():
    recently_played = request.json
    set_user_recently_played(recently_played)
    return '', 204
