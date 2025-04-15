// Funkcja do uzyskania zgody na powiadomienia
function requestNotificationPermission() {
    if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Użytkownik udzielił zgody na powiadomienia.");
            } else {
                console.log("Użytkownik odmówił zgody na powiadomienia.");
            }
        }).catch(error => console.error("Błąd przy żądaniu zgody na powiadomienia:", error));
    } else {
        console.log("Stan zgody na powiadomienia:", Notification.permission);
    }
}

let map = L.map('map').setView([53.430127, 14.564802], 18);
L.tileLayer.provider('Esri.WorldImagery').addTo(map);
let marker = null;

document.getElementById("getLocation").addEventListener("click", function() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(position => {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;
        map.setView([lat, lon]);

        if (marker) map.removeLayer(marker);
        marker = L.marker([lat, lon]).addTo(map).bindPopup("To jest Twoja lokalizacja!").openPopup();
    });
});

document.getElementById("saveButton").addEventListener("click", function() {
    // Poproś o zgodę na wyświetlanie powiadomień podczas pierwszego kliknięcia
    requestNotificationPermission();

    leafletImage(map, function (err, canvas) {
        let rasterMap = document.getElementById("rasterMap");
        let rasterContext = rasterMap.getContext("2d");
        rasterContext.drawImage(canvas, 0, 0, 300, 150);

        let pieces = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let pieceCanvas = document.createElement("canvas");
                pieceCanvas.width = 75;
                pieceCanvas.height = 75;
                let pieceContext = pieceCanvas.getContext("2d");
                pieceContext.drawImage(canvas, j * 75, i * 75, 75, 75, 0, 0, 75, 75);
                pieceCanvas.classList.add("puzzle-piece");
                pieceCanvas.draggable = true;
                pieceCanvas.dataset.position = i * 4 + j;
                pieces.push(pieceCanvas);
            }
        }

        pieces = pieces.sort(() => Math.random() - 0.5);
        let puzzleContainer = document.getElementById("puzzleContainer");
        puzzleContainer.innerHTML = "";
        pieces.forEach(piece => puzzleContainer.appendChild(piece));

        let assemblyContainer = document.getElementById("assemblyContainer");
        assemblyContainer.innerHTML = "";
        for (let i = 0; i < 16; i++) {
            let slot = document.createElement("div");
            slot.classList.add("assembly-slot");
            slot.dataset.position = i;
            assemblyContainer.appendChild(slot);
        }

        let draggedPiece = null;
        pieces.forEach(piece => {
            piece.addEventListener("dragstart", function(event) {
                draggedPiece = event.target;
            });
        });

        let slots = document.querySelectorAll(".assembly-slot");
        slots.forEach(slot => {
            slot.addEventListener("dragover", function(event) {
                event.preventDefault();
            });

            slot.addEventListener("drop", function(event) {
                event.preventDefault();
                if (this.children.length === 0) {
                    this.appendChild(draggedPiece);
                    sprawdzUlozenie();
                }
            });
        });

        function sprawdzUlozenie() {
            let correct = true;
            slots.forEach((slot, index) => {
                if (slot.children.length > 0) {
                    let piece = slot.children[0];
                    if (parseInt(piece.dataset.position) !== index) {
                        correct = false;
                    }
                } else {
                    correct = false;
                }
            });

            if (correct) {
                console.log("Puzzle ułożone prawidłowo!");
                if (Notification.permission === "granted") {
                    new Notification("Gratulacje! Ułożyłeś puzzle poprawnie!");
                }
            } else {
                console.log("Puzzle jeszcze nie są ułożone poprawnie.");
            }
        }
    });
});
