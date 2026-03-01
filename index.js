const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

const students = JSON.parse(fs.readFileSync('students_prepo_25_26.json'));

const ADMIN_NUMBERS = ["243XXXXXXXXX@c.us"];

let bannedUsers = new Set();
let loggedUsers = {};

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/data/data/com.termux/files/usr/bin/chromium-browser',
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--no-first-run',
            '--no-zygote',
            '--single-process'
        ]
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot WhatsApp prêt ✅');
});

client.on('message', async message => {

    const user = message.from;
    const text = message.body.trim().toLowerCase();

    if (bannedUsers.has(user)) {
        return message.reply("🚫 Vous êtes banni.");
    }

    // START
    if (text === "start") {
        return message.reply(`🎓 Bienvenue sur OptSolution ESU Bot

Entrez votre matricule pour accéder à votre tableau de bord.`);
    }

    // ADMIN
    if (ADMIN_NUMBERS.includes(user)) {

        if (text === "stats") {
            return message.reply(`📊 Total étudiants : ${Object.keys(students).length}`);
        }

        if (text.startsWith("ban ")) {
            let number = text.split(" ")[1] + "@c.us";
            bannedUsers.add(number);
            return message.reply("🚫 Utilisateur banni.");
        }

        if (text.startsWith("unban ")) {
            let number = text.split(" ")[1] + "@c.us";
            bannedUsers.delete(number);
            return message.reply("✅ Utilisateur débanni.");
        }
    }

    // LOGOUT
    if (text === "logout") {
        delete loggedUsers[user];
        return message.reply(`🚪 Vous êtes déconnecté.
Entrez votre matricule pour vous reconnecter.`);
    }

    // INFO
    if (text === "info" && loggedUsers[user]) {
        const matricule = loggedUsers[user];
        const student = students[matricule];

        return message.reply(`📊 INFORMATIONS DÉTAILLÉES

👤 Nom : ${student.nom}
🆔 Matricule : ${matricule}
🚻 Sexe : ${student.sexe}
🏫 Filière : Préparatoire Polytech
📅 Année : 2025-2026

Tapez 'back' pour retourner.`);
    }

    // BACK
    if (text === "back" && loggedUsers[user]) {
        const matricule = loggedUsers[user];
        const student = students[matricule];

        return message.reply(`🎓 TABLEAU DE BORD

👤 Nom : ${student.nom}
🆔 Matricule : ${matricule}
🚻 Sexe : ${student.sexe}

Tapez 'info' pour voir infos complètes
Tapez 'logout' pour se déconnecter`);
    }

    // MATRICULE
    if (students[text]) {

        const data = students[text];
        loggedUsers[user] = text;

        return message.reply(`🎓 TABLEAU DE BORD

👤 Nom : ${data.nom}
🆔 Matricule : ${text}
🚻 Sexe : ${data.sexe}

Tapez 'info' pour voir infos complètes
Tapez 'logout' pour se déconnecter`);
    }

    return message.reply("❌ Matricule introuvable.");
});

client.initialize();
