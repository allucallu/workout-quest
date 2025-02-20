// Fungsi untuk menyimpan data pengguna
// Fungsi untuk menyimpan data pengguna
function saveUserData(name, age) {
    localStorage.setItem('name', name);
    localStorage.setItem('age', age);
    localStorage.setItem('level', '1'); // Level awal
    localStorage.setItem('xp', '0'); // XP awal
    localStorage.setItem('rank', 'F'); // Tingkatan awal
}

// Fungsi untuk mengambil data pengguna
function getUserData() {
    return {
        name: localStorage.getItem('name') || 'Pengguna',
        level: localStorage.getItem('level') || '1',
        xp: localStorage.getItem('xp') || '0',
        rank: localStorage.getItem('rank') || 'F'
    };
}

// Fungsi untuk mengisi data profil
function fillProfileData() {
    const userData = getUserData();
    document.getElementById('userName').textContent = userData.name;
    document.getElementById('userLevel').textContent = userData.level;
    document.getElementById('userXp').textContent = userData.xp;
    document.getElementById('userRank').textContent = userData.rank;
}

// Panggil fungsi fillProfileData di halaman profil
if (window.location.pathname.endsWith('profile.html')) {
    fillProfileData();
}

// Fungsi untuk menghitung jarak antara dua koordinat (dalam KM)
function calculateDistance(pos1, pos2) {
    const R = 6371; // Radius bumi dalam KM
    const dLat = (pos2.latitude - pos1.latitude) * (Math.PI / 180);
    const dLon = (pos2.longitude - pos1.longitude) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(pos1.latitude * (Math.PI / 180)) *
        Math.cos(pos2.latitude * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Jarak dalam KM
}

// Fungsi untuk mengupdate XP, level, dan tingkatan
// Fungsi untuk mengupdate XP, level, dan tingkatan
function updateXp(xpEarned) {
    let currentXp = parseInt(localStorage.getItem('xp')) || 0;
    currentXp += xpEarned;
    localStorage.setItem('xp', currentXp);

    // Update level (setiap 1000 XP naik level)
    const level = Math.floor(currentXp / 1000) + 1;
    localStorage.setItem('level', level);

    // Update tingkatan (setiap 5 level naik tingkatan)
    const ranks = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SSR'];
    const rankIndex = Math.min(Math.floor(level / 5), ranks.length - 1);
    localStorage.setItem('rank', ranks[rankIndex]);

    // Update tampilan di halaman profil
    if (window.location.pathname.endsWith('profile.html')) {
        fillProfileData();
    }
}

// Contoh pemanggilan updateXp setelah lari
function stopTracking() {
    if (!isRunning) return;

    isRunning = false;
    document.getElementById('startRun').disabled = false;
    document.getElementById('stopRun').disabled = true;
    trackingStatus.textContent = 'Status: Tidak aktif';

    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    const xpEarned = Math.round(distance * 100);
    updateXp(xpEarned); // Update XP, level, dan tingkatan
    saveRunHistory(distance, xpEarned); // Simpan riwayat lari
}

// Logic untuk halaman awal (index.html)
if (window.location.pathname.endsWith('index.html')) {
    document.getElementById('userForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const age = document.getElementById('age').value;

        if (name && age) {
            saveUserData(name, age);
            window.location.href = 'home.html'; // Redirect ke halaman utama
        } else {
            alert('Harap isi nama dan umur dengan benar!');
        }
    });
}

// Logic untuk halaman utama (home.html)
if (window.location.pathname.endsWith('home.html')) {
    let startPos = null;
    let distance = 0;
    let isRunning = false;
    let watchId = null;

    document.getElementById('startRun').addEventListener('click', startTracking);
    document.getElementById('stopRun').addEventListener('click', stopTracking);

        const trackingStatus = document.getElementById('trackingStatus');

            function startTracking() {
                if (isRunning) return;

                isRunning = true;
                document.getElementById('startRun').disabled = true;
                document.getElementById('stopRun').disabled = false;
                trackingStatus.textContent = 'Status: Aktif';

                if (navigator.geolocation) {
                    startPos = null;
                    distance = 0;
                    watchId = navigator.geolocation.watchPosition(updatePosition, handleError, {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    });
                } else {
                    alert('Geolocation tidak didukung di browser ini.');
                }
            }

            function stopTracking() {
                if (!isRunning) return;

                isRunning = false;
                document.getElementById('startRun').disabled = false;
                document.getElementById('stopRun').disabled = true;
                trackingStatus.textContent = 'Status: Tidak aktif';

                if (watchId) {
                    navigator.geolocation.clearWatch(watchId);
                    watchId = null;
                }

                const xpEarned = Math.round(distance * 100);
                updateXp(xpEarned);
            }

    function updatePosition(position) {
        if (!startPos) {
            startPos = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
        } else {
            const newPos = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            distance += calculateDistance(startPos, newPos);
            startPos = newPos;
        }

        document.getElementById('distance').textContent = distance.toFixed(2);
    }

    function handleError(error) {
        console.error('Error saat tracking:', error);
        alert('Error saat tracking lokasi. Pastikan GPS aktif.');
    }
}

// Logic untuk halaman profil (profile.html)
if (window.location.pathname.endsWith('profile.html')) {
    fillProfileData();

    // Data untuk diagram melingkar
    const ctx = document.getElementById('statsChart').getContext('2d');
    const statsChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Strength', 'Agility', 'Intelligence'],
            datasets: [{
                label: 'Statistik',
                data: [19, 10, 10], // Data statistik
                backgroundColor: [
                    '#ff6384', // Warna merah muda
                    '#36a2eb', // Warna biru
                    '#ffce56'  // Warna kuning
                ],
                borderColor: '#0a0a1a', // Warna border
                borderWidth: 2,
                hoverOffset: 10 // Efek hover
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff' // Warna teks legend
                    }
                },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw}`;
                        }
                    }
                }
            },
            animation: {
                animateScale: true, // Animasi scale saat pertama kali muncul
                animateRotate: true // Animasi rotate saat pertama kali muncul
            }
        }
    });

    function saveRunHistory(distance, xpEarned) {
        const runHistory = JSON.parse(localStorage.getItem('runHistory')) || [];
        runHistory.push({ distance: distance.toFixed(2), xp: xpEarned, date: new Date().toLocaleString() });
        localStorage.setItem('runHistory', JSON.stringify(runHistory));
    }
    
    function stopTracking() {
        if (!isRunning) return;
    
        isRunning = false;
        document.getElementById('startRun').disabled = false;
        document.getElementById('stopRun').disabled = true;
        trackingStatus.textContent = 'Status: Tidak aktif';
    
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }
    
        const xpEarned = Math.round(distance * 100);
        updateXp(xpEarned);
        saveRunHistory(distance, xpEarned); // Simpan riwayat lari
    }

    function displayRunHistory() {
        const runHistory = JSON.parse(localStorage.getItem('runHistory')) || [];
        const runHistoryList = document.getElementById('runHistoryList');
        runHistoryList.innerHTML = runHistory.map(run => `
            <li>${run.date} - Jarak: ${run.distance} KM, XP: ${run.xp}</li>
        `).join('');
    }
    
    if (window.location.pathname.endsWith('profile.html')) {
        fillProfileData();
        displayRunHistory(); // Tampilkan riwayat lari
    }
}