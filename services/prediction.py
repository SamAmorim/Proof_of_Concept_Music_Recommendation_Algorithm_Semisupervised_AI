import numpy as np
import pandas as pd
from flask import jsonify
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from services.spotify import get_recently_played

# Função para recomendar músicas com base nas músicas ouvidas pelo usuário
def recommend_music(user_recent_tracks, unheard_music, music_features, n_recommendations=10):
    user_cluster = (user_recent_tracks['predicted_cluster'].value_counts().head(3).index).tolist()

    cluster_music = unheard_music[unheard_music['cluster_label'].isin(user_cluster)]

    heard_music_features = user_recent_tracks[music_features]
    cluster_music_features = cluster_music[music_features]

    similarity_scores = cosine_similarity(heard_music_features, cluster_music_features)

    recommendations = []

    for i in range(similarity_scores.shape[0]):

        similar_songs_idx = similarity_scores[i].argsort()[-n_recommendations:][::-1]
        similar_songs = cluster_music.iloc[similar_songs_idx]

        similar_scores = similarity_scores[i][similar_songs_idx]

        similar_songs = similar_songs.copy()
        similar_songs['similarity'] = similar_scores

        recommendations.append(similar_songs)

    recommended_songs = pd.concat(recommendations).drop_duplicates()
    return recommended_songs

# Método para obter recomendações baseadas nas músicas ouvidas pelo usuário
def get_music_recommendation():
    # Obter músicas recentemente ouvidas pelo usuário e transformar em DataFrame
    music_df = pd.read_csv("music_data/music_data.csv")

    recently_played = get_recently_played()
    recently_played_df = pd.DataFrame(recently_played)

    # # Alinhar tipos de dados para garantir consistência ao adicionar novas músicas
    for col in music_df.columns:
        if col in recently_played_df.columns:
            recently_played_df[col] = recently_played_df[col].astype(music_df[col].dtype)

    # Identificar e adicionar novas músicas ao DataFrame
    new_tracks = recently_played_df[~recently_played_df['id'].isin(music_df['id'])]
    new_tracks = new_tracks.reindex(columns=music_df.columns, fill_value=np.nan)
    music_df = pd.concat([music_df, new_tracks], ignore_index=True)

    music_features = [
        'valence', 'year', 'acousticness', 'danceability', 'duration_ms',
        'explicit', 'instrumentalness', 'liveness', 'loudness', 'speechiness', 'tempo'
    ]

    X = music_df[music_features]

    # Pipeline para clustering das músicas
    song_cluster_pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('kmeans', KMeans(n_clusters=7, n_init=30, verbose=0))
    ])

    song_cluster_pipeline.fit(X)
    song_cluster_labels = song_cluster_pipeline.predict(X)
    music_df['cluster_label'] = song_cluster_labels

    features = music_df[music_features]
    labels = music_df['cluster_label'] 
    X_train, X_test, y_train, y_test = train_test_split(features, labels, test_size=0.3, random_state=42)

    model = RandomForestClassifier(random_state=42)
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    user_features = recently_played_df[music_features]

    user_predictions = model.predict(user_features)

    recently_played_df['predicted_cluster'] = user_predictions

    unheard_music = music_df.merge(recently_played_df[['id']], on='id', how='left', indicator=True).query('_merge == "left_only"').drop('_merge', axis=1)

    pd.options.display.float_format = '{:.10f}'.format

    recommendation_df = recommend_music(recently_played_df, unheard_music, music_features)
    
    return jsonify(recommendation_df.to_dict(orient='records'))
