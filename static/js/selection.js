const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const trackList = document.getElementById('track-list');
const trackComponent = document.getElementById('track-component');
const loadMoreButton = document.getElementById('load-more');
const continueButton = document.getElementById('continue-button');

const newTrackComponent = trackComponent.cloneNode(true);

var selectedTracks = [];
var tracks = [];

async function searchTracks() {
    query = searchInput.value;
    offset = tracks.length;

    await fetch(`/spotify/search?q=${query}&offset=${offset}`)
        .then(response => response.json())
        .then(
            data => {
                if (data.error) {
                    console.error(data);
                    trackList.innerHTML = `<p class="text-center text-white">Erro ao pesquisar: </p><p class="text-center text-white">${JSON.stringify(data.error)}</p>`;
                    return;
                }

                tracks = tracks.concat(data.items);
                var totalTracks = data.total;

                if (totalTracks > tracks.length) {
                    loadMoreButton.style.display = 'block';
                } else {
                    loadMoreButton.style.display = 'none';
                }
            },
            error => {
                console.error(error);
                trackList.innerHTML = `<p class="text-center text-white">Erro ao pesquisar: </p><p class="text-center text-white">${JSON.stringify(error)}</p>`;
            }
        );
}

async function updateTracks(paged = false) {
    if (!paged) {
        selectedTracks = [];
    }
    
    trackList.innerHTML = '';

    tracks.forEach((track, index) => {
        const newTrackComponent = trackComponent.cloneNode(true);

        newTrackComponent.id = `track-component-${index}`;
        newTrackComponent.style.display = 'block';

        const trackName = newTrackComponent.querySelector('#track-name');
        trackName.id = `track-name-${index}`;
        trackName.textContent = track.name;

        const trackArtist = newTrackComponent.querySelector('#track-artist');
        trackArtist.id = `track-artist-${index}`;
        trackArtist.textContent = track.artists.join(', ');

        const trackCheckbox = newTrackComponent.querySelector('#track-checkbox');
        trackCheckbox.id = `track-checkbox-${index}`;

        const trackCard = newTrackComponent.querySelector('#track-card');
        trackCard.id = `track-card-${index}`;
        trackCard.htmlFor = `track-button-${index}`;

        const trackButton = newTrackComponent.querySelector('#track-button');
        trackButton.id = `track-button-${index}`;
        trackButton.addEventListener('change', (event) => {
            trackCheckbox.checked = event.target.checked;
            if (event.target.checked) {
                selectedTracks.push(track);
            } else {
                selectedTracks = selectedTracks.filter(track => track.id !== track.id);
            }
        });

        trackList.appendChild(newTrackComponent);
    });
}

async function selectTracks() {
    await fetch('/spotify/select', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedTracks)
    })
        .then(
            data => {
                if (data.error) {
                    console.error(data);
                    trackList.innerHTML = `<p class="text-center text-white">Erro ao selecionar músicas: </p><p class="text-center text-white">${JSON.stringify(data.error)}</p>`;
                    return;
                }

                window.location.href = '/report';
            },
            error => {
                console.error(error);
                trackList.innerHTML = `<p class="text-center text-white">Erro ao selecionar músicas: </p><p class="text-center text-white">${JSON.stringify(error)}</p>`;
            }
        );
}

searchInput.addEventListener('keyup', async (event) => {
    if (event.key === 'Enter') {
        await searchTracks();
        await updateTracks();
    }
});

searchButton.addEventListener('click', async () => {
    await searchTracks();
    await updateTracks();
});

loadMoreButton.addEventListener('click', async () => {
    await searchTracks();
    await updateTracks(true);
});

continueButton.addEventListener('click', async () => {
    continueButton.disabled = true;
    await selectTracks();
});