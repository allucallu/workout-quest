// Fungsi untuk menyimpan data pengguna
function saveUserData(name, age) {
    localStorage.setItem('name', name);
    localStorage.setItem('age', age);
    localStorage.setItem('level', '1'); // Level awal
    localStorage.setItem('xp', '0'); // XP awal
    localStorage.setItem('rank', 'F'); // Tingkatan awal
    localStorage.setItem('motivation', '0'); // Motivasi awal
    localStorage.setItem('laziness', '0'); // Kemalasan awal
    localStorage.setItem('speed', '0'); // Kecepatan awal
    localStorage.setItem('endurance', '0'); // Ketahanan awal
    localStorage.setItem('lastActivityDate', ''); // Tanggal aktivitas terakhir
}

// Fungsi untuk mengambil data pengguna
function getUserData() {
    return {
        name: localStorage.getItem('name') || 'Pengguna',
        level: localStorage.getItem('level') || '1',
        xp: localStorage.getItem('xp') || '0',
        rank: localStorage.getItem('rank') || 'F',
        motivation: parseInt(localStorage.getItem('motivation')) || 0,
        laziness: parseInt(localStorage.getItem('laziness')) || 0,
        speed: parseFloat(localStorage.getItem('speed')) || 0,
        endurance: parseFloat(localStorage.getItem('endurance')) || 0
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

// Fungsi untuk update statistik setelah joging
function updateStats(distance, time) {
    const today = new Date().toDateString();
    const lastActivityDate = localStorage.getItem('lastActivityDate');

    // Cek apakah pengguna sudah joging hari ini
    if (lastActivityDate !== today) {
        let motivation = parseInt(localStorage.getItem('motivation')) || 0;
        let laziness = parseInt(localStorage.getItem('laziness')) || 0;
        let speed = parseFloat(localStorage.getItem('speed')) || 0;
        let endurance = parseFloat(localStorage.getItem('endurance')) || 0;

        // Update motivasi dan kemalasan
        if (distance > 0) {
            motivation += 1;
            laziness = Math.max(laziness - 1, 0); // Kemalasan tidak boleh negatif
        } else {
            laziness += 1;
        }

        // Update kecepatan (dalam menit per kilometer)
        if (distance > 0) {
            const currentSpeed = time / distance; // Waktu (menit) / Jarak (km)
            speed = (speed + currentSpeed) / 2; // Rata-rata kecepatan
        }

        // Update ketahanan (jarak lari hari ini)
        endurance = distance;

        // Simpan data ke localStorage
        localStorage.setItem('motivation', motivation);
        localStorage.setItem('laziness', laziness);
        localStorage.setItem('speed', speed.toFixed(2));
        localStorage.setItem('endurance', endurance.toFixed(2));
        localStorage.setItem('lastActivityDate', today);
    }

    // Update chart
    updateChart();
}

// Fungsi untuk update chart
function updateChart() {
    const userData = getUserData();
    const ctx = document.getElementById('statsChart').getContext('2d');
    const statsChart = new Chart(ctx, {
        type: 'radar', // Ganti ke radar chart
        data: {
            labels: ['Motivation', 'Laziness', 'Speed', 'Endurance'],
            datasets: [{
                label: 'Statistik',
                data: [userData.motivation, userData.laziness, userData.speed, userData.endurance],
                backgroundColor: 'rgba(0, 191, 255, 0.2)', // Warna biru neon dengan transparansi
                borderColor: '#00bfff', // Warna border biru neon
                borderWidth: 2,
                pointBackgroundColor: '#00bfff', // Warna titik biru neon
                pointBorderColor: '#ffffff', // Warna border titik putih
                pointHoverBackgroundColor: '#ffffff', // Warna titik saat hover
                pointHoverBorderColor: '#00bfff' // Warna border titik saat hover
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    angleLines: {
                        color: '#ffffff' // Warna garis sudut
                    },
                    grid: {
                        color: '#ffffff' // Warna grid
                    },
                    pointLabels: {
                        color: '#ffffff' // Warna label
                    },
                    ticks: {
                        color: '#ffffff', // Warna angka
                        backdropColor: '#0a0a1a' // Warna background angka
                    }
                }
            },
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
            }
        }
    });
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
    const trackingStatus = document.getElementById('trackingStatus');

    document.getElementById('startRun').addEventListener('click', startTracking);
    document.getElementById('stopRun').addEventListener('click', stopTracking);

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
        updateStats(distance, 30); // Contoh: waktu tempuh 30 menit
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
    updateChart(); // Tampilkan chart statistik
}