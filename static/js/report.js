const reportTypeForm = document.getElementById('report-type-form');

const recentlyPlayedContainer = document.getElementById('recently-played-container');
const recentlyPlayedSpinner = document.getElementById('recently-played-spinner');

const aiRecommendationContainer = document.getElementById('ai-recommendation-container');
const aiRecommendationSpinner = document.getElementById('ai-recommendation-spinner');

const trackComponent = document.getElementById('track-component');

const artistsList = document.getElementById('artists-list');
const artistComponent = document.getElementById('artist-component');
const artistsSpinner = document.getElementById('artists-spinner');

const metricsTracks = document.getElementById('metric-tracks');
const metricsTracksSpinner = document.getElementById('metric-tracks-spinner');
const metricsArtists = document.getElementById('metric-artists');
const metricsArtistsSpinner = document.getElementById('metric-artists-spinner');

const characteristicsSpinner = document.getElementById('characteristics-spinner');
const characteristicsChart = document.getElementById('characteristics-chart');
const wordsSpinner = document.getElementById('words-spinner');
const wordsChart = document.getElementById('words-chart');

Chart.register(ChartDataLabels);

const featureNames = {
    acousticness: 'Acústica',
    danceability: 'Dançante',
    energy: 'Energética',
    valence: 'Positiva',
    liveness: 'Ao Vivo',
    instrumentalness: 'Instrumental',
    speechiness: 'Falada'
};

var aiRecommendationFetched = false;

async function getReports() {
    recentlyPlayedSpinner.style.display = 'block';
    artistsSpinner.style.display = 'block';

    metricsTracksSpinner.style.display = 'block';
    metricsArtistsSpinner.style.display = 'block';

    characteristicsSpinner.style.display = 'block';
    wordsSpinner.style.display = 'block';

    var recentlyPlayed = [];
    var mostListenedArtists = [];
    var mostPresentFeatures = [];
    var mostPresentWords = [];
    var metrics = {};

    var colors = [
        {
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
        },
        {
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
        },
        {
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderColor: 'rgba(255, 206, 86, 1)',
        },
        {
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
        },
        {
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
        },
        {
            backgroundColor: 'rgba(255, 159, 64, 0.2)',
            borderColor: 'rgba(255, 159, 64, 1)',
        },
        {
            backgroundColor: 'rgba(181, 255, 8, 0.2)',
            borderColor: 'rgba(181, 255, 8, 1)',
        }
    ]

    async function createRecentlyPlayed() {
        recentlyPlayed.forEach(item => {
            const newTrackComponent = trackComponent.cloneNode(true);
            newTrackComponent.style.display = 'block';
            newTrackComponent.querySelector('#track-name').textContent = item.name;
            newTrackComponent.querySelector('#track-artist').textContent = item.artists.join(', ');
            recentlyPlayedContainer.appendChild(newTrackComponent);
        });

        recentlyPlayedSpinner.style.display = 'none';
    };

    async function createMetrics() {
        metricsArtists.textContent = metrics.artists;
        metricsTracks.textContent = metrics.tracks;

        metricsTracksSpinner.style.display = 'none';
        metricsArtistsSpinner.style.display = 'none';
    };

    async function createMostListenedArtists() {
        mostListenedArtists.forEach((artist, index) => {
            const newArtistComponent = artistComponent.cloneNode(true);
            newArtistComponent.style.display = 'flex';

            if (index === 0)
                newArtistComponent.classList.add('bg-primary');

            newArtistComponent.querySelector('#artist-name').textContent = artist[0];

            if (index === 0)
                newArtistComponent.querySelector('#artist-name').classList.add('fw-bolder');

            newArtistComponent.querySelector('#artist-plays').textContent = artist[1];

            if (index === 0)
                newArtistComponent.querySelector('#artist-plays').classList.add('fw-bolder');

            artistsList.appendChild(newArtistComponent);
        });

        artistsSpinner.style.display = 'none';
    };

    async function createCharacteristicsChart() {
        new Chart(
            characteristicsChart,
            {
                type: 'bar',
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            ticks: {
                                color: "#fff"
                            },
                            grid: {
                                display: false
                            }
                        },
                        y: {
                            ticks: {
                                color: "#fff",
                                callback: value => value + "%"
                            },
                            grid: {
                                color: "rgba(255, 255, 255, 0.25)"
                            },
                            max: 100
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: false
                        },
                        datalabels: {
                            display: false
                        }
                    }
                },
                data: {
                    labels: Object.keys(mostPresentFeatures).map(feature => getStringCapitalizedWords(featureNames[feature])),
                    datasets: [
                        {
                            label: 'Média',
                            data: Object.values(mostPresentFeatures).map(value => value * 100),
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(255, 159, 64, 0.2)',
                                'rgba(181, 255, 8, 0.2)'
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)',
                                'rgba(181, 255, 8, 1)'
                            ],
                            borderWidth: 1
                        }
                    ]
                }
            }
        );

        characteristicsSpinner.style.display = 'none';
    };

    async function createWordsChart() {
        new Chart(
            wordsChart,
            {
                type: 'bar',
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            ticks: {
                                color: "#fff"
                            },
                            grid: {
                                display: false
                            }
                        },
                        y: {
                            ticks: {
                                color: "#fff"
                            },
                            grid: {
                                color: "rgba(255, 255, 255, 0.25)"
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: false
                        },
                        datalabels: {
                            display: false
                        }
                    }
                },
                data: {
                    labels: mostPresentWords.map(word => word[0]),
                    datasets: [
                        {
                            label: 'Ocorrências',
                            data: mostPresentWords.map(word => word[1]),
                            backgroundColor: 'rgba(153, 102, 255, 0.25)',
                            borderColor: 'rgba(153, 102, 255, 1)',
                            borderWidth: 1
                        }
                    ]
                }
            }
        );

        wordsSpinner.style.display = 'none';
    }

    async function fetchData() {
        await fetch('/spotify/recently-played')
            .then(response => response.json())
            .then(
                data => {
                    if (data.error) {
                        console.error(data);
                        recentlyPlayedContainer.innerHTML = `<p class="text-center text-white">Erro ao carregar músicas recentes</p><p class="text-center text-white">${JSON.stringify(data.error)}</p>`;
                        return;
                    }

                    recentlyPlayed = data;
                },
                error => {
                    console.error(error);
                    recentlyPlayedContainer.innerHTML = `<p class="text-center text-white">Erro ao carregar músicas recentes</p><p class="text-center text-white">${JSON.stringify(error)}</p>`;
                }
            );

        await fetch('/report/data')
            .then(response => response.json())
            .then(
                data => {
                    if (data.error) {
                        console.error(data);
                        return;
                    }

                    mostListenedArtists = data.most_listened_artists;
                    mostPresentFeatures = data.most_present_features;
                    mostPresentWords = data.most_present_words;
                    metrics = data.metrics;
                }
            )
    }

    await fetchData();

    await createRecentlyPlayed();
    await createMetrics();
    await createMostListenedArtists();
    await createCharacteristicsChart();
    await createWordsChart();
}

getReports();

async function getAiRecommendation() {
    aiRecommendationSpinner.style.display = 'block';

    await fetch('/prediction')
        .then(response => response.json())
        .then(
            data => {
                if (data.error) {
                    console.error(data);
                    aiRecommendationContainer.innerHTML = `<p class="text-center text-white">Erro ao carregar recomendação</p><p class="text-center text-white">${JSON.stringify(data.error)}</p>`;
                    return;
                }

                data.forEach(item => {
                    const newTrackComponent = trackComponent.cloneNode(true);
                    newTrackComponent.style.display = 'block';
                    newTrackComponent.querySelector('#prediction-precision').textContent = (item.similarity * 100).toFixed(2) + "%";
                    newTrackComponent.querySelector('#track-name').textContent = item.name;
                    newTrackComponent.querySelector('#track-artist').textContent = item.artists[0].name;

                    aiRecommendationContainer.appendChild(newTrackComponent);
                });
            },
            error => {
                console.error(error);
                aiRecommendationContainer.innerHTML = `<p class="text-center text-white">Erro ao carregar recomendação</p><p class="text-center text-white">${JSON.stringify(error)}</p>`;
            }
        );

    aiRecommendationSpinner.style.display = 'none';
};

reportTypeForm.addEventListener('change', e => {
    if (e.target.id === 'recently-played') {
        recentlyPlayedContainer.style.display = 'flex';
        aiRecommendationContainer.style.display = 'none';
    } else {
        recentlyPlayedContainer.style.display = 'none';
        aiRecommendationContainer.style.display = 'flex';

        if (aiRecommendationFetched === false) {
            aiRecommendationFetched = true;
            getAiRecommendation();
        }
    }
});
