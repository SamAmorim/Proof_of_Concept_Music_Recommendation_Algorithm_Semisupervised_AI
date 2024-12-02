import json
import ast
import pandas as pd

def set_user_recently_played(recently_played):
    recently_played = pd.DataFrame(recently_played)
    recently_played.to_json(r'recentes.json', orient='records')

# Função para obter as músicas recentemente ouvidas pelo usuário
def get_recently_played():
    with open('recentes.json', 'r') as f:
        tracks = json.load(f)
        return tracks

# Função para pesquisar músicas
def get_search(search_query, offset=0):
    music_df = pd.read_csv("music_data/music_data.csv")
    search_results = music_df[music_df['name'].str.contains(search_query, case=False) | music_df['artists'].str.contains(search_query, case=False)]
    
    total = search_results.shape[0]
    search_results = search_results.iloc[offset:offset+20].to_dict('records')
    
    for track in search_results:
        artists = ast.literal_eval(track['artists'])
        track['artists'] = artists
    
    search_results = {
        'total': total,
        'items': search_results
    }
    
    return search_results