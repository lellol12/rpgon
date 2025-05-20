class Sect {
    constructor(name, founderId, founderName, description = "A mysterious sect.", motto = "Cultivate and Ascend!", location = "Unspecified Region", bannerUrl = null) {
        console.log('sect.js: Sect constructor called for', name);
        this.sectId = (typeof generateId === 'function') ? generateId() : 'temp_sect_id_' + Math.random(); // Use global generateId
        this.name = name;
        this.founderId = founderId;
        this.founderName = founderName;
        this.description = description;
        this.motto = motto;
        this.location = location;
        this.bannerUrl = bannerUrl;
        this.createdAt = (typeof firebase !== 'undefined' && firebase.firestore) ? firebase.firestore.FieldValue.serverTimestamp() : new Date();

        this.buffs = [];

        this.members = {
            [founderId]: {
                playerName: founderName,
                role: "Founder",
                joinedAt: (typeof firebase !== 'undefined' && firebase.firestore) ? firebase.firestore.FieldValue.serverTimestamp() : new Date(),
                contributionPoints: 0
            }
        };

        // Assuming DEFAULT_SECT_RANKS is globally available from data.js or Game.DEFAULT_SECT_RANKS is set
        this.ranks = JSON.parse(JSON.stringify( (typeof Game !== 'undefined' && Game.DEFAULT_SECT_RANKS) ? Game.DEFAULT_SECT_RANKS : DEFAULT_SECT_RANKS || [] ));


        this.treasury = {
            spiritStones: 0
        };

        this.totalContributionPoints = 0;
        this.contributionLogs = [];
        this.sectPower = 0;
    }

    getMemberRole(playerId) {
        if (this.members && this.members[playerId]) {
            return this.members[playerId].role;
        }
        return null;
    }

    hasPermission(playerId, permissionKey) {
        const roleName = this.getMemberRole(playerId);
        if (!roleName) return false;

        const rank = this.ranks.find(r => r.name === roleName);
        if (!rank || !rank.permissions) return false;

        if (rank.permissions.includes(Game.SECT_PERMISSIONS.ALL)) return true; // Game.SECT_PERMISSIONS from game.js
        return rank.permissions.includes(permissionKey);
    }


    addMember(playerId, playerName, role = "Outer Disciple") {
        console.log('sect.js: addMember called for sect:', this.name, 'player:', playerName);
        if (this.members[playerId]) {
            if (typeof displayMessage === 'function') displayMessage(`${playerName} is already a member of ${this.name}.`, 'narration');
            return;
        }
        const defaultNewMemberRank = this.ranks.find(r => r.isDefaultNewMember) || this.ranks.find(r => r.name === "Outer Disciple");
        const assignedRole = role === "Founder" ? "Founder" : (defaultNewMemberRank ? defaultNewMemberRank.name : "Outer Disciple");

        this.members[playerId] = {
            playerName: playerName,
            role: assignedRole,
            joinedAt: (typeof firebase !== 'undefined' && firebase.firestore) ? firebase.firestore.FieldValue.serverTimestamp() : new Date(),
            contributionPoints: 0
        };
        if (typeof displayMessage === 'function') displayMessage(`${playerName} (${assignedRole}) has joined the ${this.name} sect!`, 'success');
        this.updateSectPower();
        if (typeof Game !== 'undefined' && typeof Game.saveSectData === 'function') Game.saveSectData(this.sectId);
    }

    removeMember(playerId) {
        console.log('sect.js: removeMember called for sect:', this.name, 'player ID:', playerId);
        if (this.members[playerId]) {
            const memberName = this.members[playerId].playerName || "A member";
            if (playerId === this.founderId && Object.keys(this.members).length > 1) {
                if (typeof displayMessage === 'function') displayMessage(`The founder ${memberName} cannot leave the sect while other members remain. Transfer leadership first.`, 'error');
                return;
            }
            delete this.members[playerId];
            if (typeof displayMessage === 'function') displayMessage(`${memberName} has left the ${this.name} sect.`, 'narration');
            this.updateSectPower();

            if (Object.keys(this.members).length === 0) {
                if (typeof displayMessage === 'function') displayMessage(`Sect ${this.name} has been disbanded as the last member left.`, 'important');
                if (typeof Game !== 'undefined' && Game.sects) delete Game.sects[this.sectId];
                if (typeof db !== 'undefined') {
                    db.collection("sects").doc(this.sectId).delete().catch(err => console.error("Error disbanding sect in DB:", err));
                }
            } else {
                if (typeof Game !== 'undefined' && typeof Game.saveSectData === 'function') Game.saveSectData(this.sectId);
            }
        } else {
            if (typeof displayMessage === 'function') displayMessage(`Player ID ${playerId} not found in sect ${this.name}.`, 'error');
        }
    }

    updateSectPower() { console.log('sect.js: updateSectPower called for sect:', this.name); /* Placeholder */ }

    toFirestoreObject() {
        console.log('sect.js: toFirestoreObject called for sect:', this.name);
        const membersForFirestore = {};
        for (const pid in this.members) {
            membersForFirestore[pid] = {
                ...this.members[pid],
                joinedAt: (this.members[pid].joinedAt instanceof firebase.firestore.Timestamp || !(typeof firebase !== 'undefined' && firebase.firestore)) ? this.members[pid].joinedAt : firebase.firestore.FieldValue.serverTimestamp()
            };
        }

        return {
            name: this.name,
            founderId: this.founderId,
            founderName: this.founderName,
            description: this.description,
            motto: this.motto,
            location: this.location,
            bannerUrl: this.bannerUrl,
            createdAt: (this.createdAt instanceof firebase.firestore.Timestamp || !(typeof firebase !== 'undefined' && firebase.firestore)) ? this.createdAt : firebase.firestore.FieldValue.serverTimestamp(),
            buffs: this.buffs,
            members: membersForFirestore,
            ranks: this.ranks,
            treasury: this.treasury,
            totalContributionPoints: this.totalContributionPoints,
            contributionLogs: this.contributionLogs.slice(-50)
        };
    }
    static fromFirestoreObject(docData, sectId) {
        console.log('sect.js: fromFirestoreObject called for sect ID:', sectId);
        const sect = new Sect(docData.name, docData.founderId, docData.founderName, docData.description, docData.motto, docData.location, docData.bannerUrl);
        Object.assign(sect, docData);
        sect.sectId = sectId;
        sect.createdAt = docData.createdAt;
        sect.members = sect.members || {};
        sect.ranks = JSON.parse(JSON.stringify( (typeof Game !== 'undefined' && Game.DEFAULT_SECT_RANKS) ? Game.DEFAULT_SECT_RANKS : DEFAULT_SECT_RANKS || [] ));
        sect.treasury = sect.treasury || { spiritStones: 0 };
        sect.contributionLogs = sect.contributionLogs || [];
        return sect;
    }

    logContribution(playerId, playerName, action, details, amount = 0) {
        console.log('sect.js: logContribution called for sect:', this.name, 'player:', playerName, 'action:', action);
        this.contributionLogs.unshift({
            playerId: playerId,
            playerName: playerName,
            action: action,
            details: details,
            amount: amount,
            timestamp: new Date()
        });
        if (this.contributionLogs.length > 100) { this.contributionLogs.pop(); }
    }
}
