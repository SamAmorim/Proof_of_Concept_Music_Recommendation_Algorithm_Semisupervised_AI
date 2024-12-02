import pandas as pd

def get_most_listened_artists(recent_tracks):
    artists = {}

    for track in recent_tracks:
        for artist in track['artists']:
            if artist in artists:
                artists[artist] += 1
            else:
                artists[artist] = 1


    return sorted(artists.items(), key=lambda x: x[1], reverse=True)[:10]

def get_most_present_words_in_title(recent_tracks):
    words = {}

    exclude = ['remastered', '-', 'remaster', 'the', 'a', 'an', 'of', 'in', 'on', 'at', 'for', 'with', 'and', 'or', 'but', 'nor', 'so', 'yet', 'to', 'from', 'by', 'as',
               'o', 'um', 'uma', 'de', 'em', 'no', 'na', 'para', 'com', 'e', 'ou', 'mas', 'nem', 'por', 'como']

    for track in recent_tracks:
        title = track['name']
        for word in title.split(' '):
            word = word.lower()
            if word not in exclude:
                if word in words:
                    words[word] += 1
                else:
                    words[word] = 1

    return sorted(words.items(), key=lambda x: x[1], reverse=True)[:10]

def get_most_present_features(recent_tracks):
    features = {
        'acousticness': 0,
        'danceability': 0,
        'energy': 0,
        'instrumentalness': 0,
        'liveness': 0,
        'speechiness': 0,
        'valence': 0
    }

    for track in recent_tracks:
        for feature in features:
            features[feature] += track[feature]

    for feature in features:
        features[feature] /= len(recent_tracks)

    return features

def get_metrics(recent_tracks):
    # Normaliza o JSON recebido
    df = pd.json_normalize(recent_tracks)

    # Conta os valores únicos para as colunas relevantes
    unique_values = {
        'tracks': len(df['id'].unique()),       # Número de faixas únicas
        'artists': len(df['artists'].explode().unique()),  # Número de artistas únicos
    }

    return unique_values