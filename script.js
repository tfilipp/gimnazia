class SoundManager {
    constructor() {
        this.sounds = {
            click: [],
            switch: [],
            open: [],
            close: [],
            ping: []
        };
        this.currentIndex = {
            click: 0,
            switch: 0,
            open: 0,
            close: 0,
            ping: 0
        };
    }

    preload() {
        const soundFiles = {
            click: 'click.mp3',
            switch: 'switch.mp3',
            open: 'open.mp3',
            close: 'close.mp3',
            ping: 'ping.mp3'
        };

        Object.entries(soundFiles).forEach(([key, file]) => {
            for (let i = 0; i < 5; i++) {
                const audio = new Audio(file);
                audio.preload = 'auto';
                this.sounds[key].push(audio);
            }
        });
    }

    play(type) {
        const soundArray = this.sounds[type];
        if (!soundArray || soundArray.length === 0) return;

        this.currentIndex[type] = (this.currentIndex[type] + 1) % soundArray.length;
        const sound = soundArray[this.currentIndex[type]];
        
        sound.currentTime = 0;
        const playPromise = sound.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Audio play failed:", error);
            });
        }
    }
}

const soundManager = new SoundManager();
soundManager.preload();

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || window.innerWidth <= 768;
}

function playSound(type) {
    if (!isMobile()) {
        soundManager.play(type);
    }
}

// Styles
const style = document.createElement('style');
style.textContent = `
    .background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(to bottom, #000510, #001040);
        z-index: 1;
        overflow: hidden;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.6s ease;
    }
    
    .background.active {
        opacity: 1;
    }

    .bubble {
        position: absolute;
        border-radius: 50%;
        filter: blur(20px);
        opacity: 0.3;
        transition: opacity 0.3s ease;
    }

    .frame {
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 8px;
        background: var(--card);
        overflow: hidden;
    }
`;
document.head.appendChild(style);

// Camera initialization
async function initCamera() {
    const video = document.createElement('video');
    video.id = 'background-video';
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsinline = true;
    
    video.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: 1;
        transition: opacity 0.6s ease;
    `;
    
    document.body.insertBefore(video, document.body.firstChild);
    
    if (isMobile()) {
        video.style.display = 'none';
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: {
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            }
        });
        video.srcObject = stream;
    } catch (err) {
        console.error('Ошибка доступа к камере:', err);
        video.style.display = 'none';
    }
}

function createBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    
    bubble.style.left = (5 + (Math.random() * 90)) + '%';
    const startY = Math.random() * 100;
    bubble.style.top = startY + '%';
    
    const size = 100 + Math.random() * 200;
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    
    const hue = 200 + Math.random() * 40;
    const saturation = 70 + Math.random() * 30;
    const lightness = 40 + Math.random() * 20;
    bubble.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    
    document.querySelector('.background').appendChild(bubble);
    
    let startTime = performance.now();
    const duration = 15000 + Math.random() * 10000;
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = elapsed / duration;
        
        if (progress < 1) {
            const currentY = startY - progress * 120;
            const wave = Math.sin(progress * Math.PI * 4) * 50;
            bubble.style.transform = `translate(${wave}px, ${currentY}vh)`;
            requestAnimationFrame(animate);
        } else {
            bubble.remove();
        }
    }
    
    requestAnimationFrame(animate);
}

function initBackground() {
    if (!isMobile()) {
        const background = document.createElement('div');
        background.className = 'background';
        document.body.insertBefore(background, document.body.firstChild);
        
        function spawnBubbles() {
            if (document.querySelectorAll('.bubble').length < 15) {
                createBubble();
            }
            setTimeout(spawnBubbles, 500 + Math.random() * 1000);
        }
        
        for(let i = 0; i < 10; i++) {
            setTimeout(() => createBubble(), i * 200);
        }
        
        spawnBubbles();
    }
}

window.addEventListener('load', () => {
    initBackground();
    initCamera();
});

function getDateString() {
    const days = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    
    const now = new Date();
    const day = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    
    return `сегодня ${day}, ${date} ${month}`;
}

const schedule = [
    { start: '08:15', end: '09:00' },
    { start: '09:10', end: '09:55' },
    { start: '10:15', end: '11:00' },
    { start: '11:10', end: '11:55' },
    { start: '12:05', end: '12:50' },
    { start: '13:10', end: '13:55' },
    { start: '14:05', end: '14:50' },
    { start: '15:00', end: '15:45' }
];

let lastUpdate = Date.now();
let lastState = null;

function updateFlipClock(hours, minutes, seconds) {
    const numbers = document.querySelectorAll('.flip-number');
    const time = `${hours.padStart(2, '0')}${minutes.padStart(2, '0')}${seconds.padStart(2, '0')}`;

    time.split('').forEach((digit, index) => {
        const el = numbers[index];
        if (el.textContent !== digit) {
            el.setAttribute('data-changing', 'true');
            el.textContent = digit;
            setTimeout(() => {
                el.removeAttribute('data-changing');
            }, 150);
        }
    });
}

function updateTime() {
    const now = new Date();
    if (Date.now() - lastUpdate < 950) return;

    lastUpdate = Date.now();
    const hours = now.getHours().toString();
    const minutes = now.getMinutes().toString();
    const seconds = now.getSeconds().toString();

    updateFlipClock(hours, minutes, seconds);
    updateScheduleInfo(`${hours}:${minutes}`);
}

function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

function updateScheduleInfo(currentTime) {
    const currentMinutes = timeToMinutes(currentTime);
    let message = getDateString() + '. ';
    let currentState = null;

    if (currentMinutes < timeToMinutes(schedule[0].start)) {
        currentState = 'before';
        const diff = timeToMinutes(schedule[0].start) - currentMinutes;
        message += `до начала занятий ${diff} минут`;
        if (diff < 1) {
            message += `до начала занятий ${Math.round((diff * 60))} секунд`;
        }
    }
    else if (currentMinutes > timeToMinutes(schedule[schedule.length - 1].end)) {
        currentState = 'after';
        message += 'уроки кончились';
    }
    else {
        for (let i = 0; i < schedule.length; i++) {
            const lessonStart = timeToMinutes(schedule[i].start);
            const lessonEnd = timeToMinutes(schedule[i].end);

            if (currentMinutes >= lessonStart && currentMinutes <= lessonEnd) {
                currentState = `lesson-${i + 1}`;
                const remaining = lessonEnd - currentMinutes;
                message += `идёт ${i + 1}-й урок. до перемены ${remaining} минут`;
                if (remaining < 1) {
                    message += `идёт ${i + 1}-й урок. до перемены ${Math.round((remaining * 60))} секунд`;
                }
                break;
            }
            else if (i < schedule.length - 1) {
                const nextLessonStart = timeToMinutes(schedule[i + 1].start);
                if (currentMinutes > lessonEnd && currentMinutes < nextLessonStart) {
                    currentState = `break-${i + 1}`;
                    const remaining = nextLessonStart - currentMinutes;
                    message += `перемена! до начала ${i + 2}-го урока осталось ${remaining} минут`;
                    if (remaining < 1) {
                        message += `перемена! до начала ${i + 2}-го урока осталось ${Math.round((remaining * 60))} секунд`;
                    }
                    break;
                }
            }
        }
    }

    if (lastState !== currentState) {
        lastState = currentState;
        if (currentState && currentState !== 'before' && currentState !== 'after') {
            playSound('ping');
        }
    }

    document.querySelector('.schedule-info').textContent = message;
}

setInterval(updateTime, 100);
updateTime();

const cards = document.querySelectorAll('.card:not(.close-button)');
let activeCard = null;

function closeActiveCard() {
    if (activeCard) {
        const frame = activeCard.querySelector('iframe');
        if (frame) {
            frame.src = 'about:blank';
        }
        activeCard.classList.remove('active');
        activeCard.innerHTML = activeCard.originalContent;
        document.querySelector('.cards').classList.remove('has-active');
        document.querySelectorAll('.close-button').forEach(btn => btn.remove());
        activeCard = null;
        
        document.getElementById('background-video').classList.remove('fade');
        document.querySelector('.background').classList.remove('active');
    }
}

cards.forEach(card => {
    card.addEventListener('mousedown', () => {
        if (!activeCard) {
            playSound('click');
        }
    });
    
    card.addEventListener('click', () => {
        const type = card.dataset.type;

        if (activeCard === card) {
            playSound('switch');
            closeActiveCard();
            return;
        }

        if (!activeCard) {
            playSound('click');
            setTimeout(() => {
                playSound('open');
            }, 100);
        } else {
            playSound('switch');
        }

        closeActiveCard();
        
        document.getElementById('background-video').classList.add('fade');
        document.querySelector('.background').classList.add('active');
        
        card.classList.add('active');
        document.querySelector('.cards').classList.add('has-active');
        
        card.originalContent = card.innerHTML;

        const closeButton = document.createElement('div');
        closeButton.className = 'card close-button';
        closeButton.innerHTML = '<span>закрыть</span>';
        closeButton.style.display = 'flex';
        closeButton.onclick = (e) => {
            e.stopPropagation();
            playSound('close');
            closeActiveCard();
        };
        document.querySelector('.cards').appendChild(closeButton);

        requestAnimationFrame(() => {
            switch(type) {
                case 'schedule':
                    card.innerHTML = `
                        <iframe class="frame" src="https://raspisanie.nikasoft.ru/23808586.html#cls" frameborder="0" scrolling="no"></iframe>
                    `;
                    break;
                case 'events':
                    card.innerHTML = `
                        <div class="frame"><h1>1 событие</h1><br><h4>внешкольный заочный турнир по bedwars, дата не установлена</h4></div>
                    `;
                    break;
                case 'site':
                    card.innerHTML = `
                        <iframe class="frame" src="https://lub-gimnazya41.edumsko.ru/" frameborder="0" scrolling="no"></iframe>
                    `;
                    break;
            }
        });

        activeCard = card;
    });
});