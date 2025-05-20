// Server-side Sect class
// Adapted from public/sect.js

// const gameData = require('../game_data'); // For DEFAULT_SECT_RANKS, SECT_PERMISSIONS
// const admin = require('firebase-admin'); // For FieldValue.serverTimestamp()
// These would be injected or accessed via a shared context/service.

class Sect {
    constructor(name, founderId, founderName, sectId = null, description = "A mysterious sect.", motto = "Cultivate and Ascend!", location = "Unspecified Region", bannerUrl = null, serverTimestampFn = null, defaultSectRanks = []) {
        // serverTimestampFn would be admin.firestore.FieldValue.serverTimestamp
        // defaultSectRanks would be gameData.DEFAULT_SECT_RANKS

        this.sectId = sectId; // Should be set by Firestore or passed in when creating
        this.name = name;
        this.founderId = founderId;
        this.founderName = founderName;
        this.description = description;
        this.motto = motto;
        this.location = location;
        this.bannerUrl = bannerUrl;
        this.createdAt = serverTimestampFn ? serverTimestampFn() : new Date();

        this.buffs = [];
        this.members = {
            [founderId]: {
                playerName: founderName,
                role: "Founder",
                joinedAt: serverTimestampFn ? serverTimestampFn() : new Date(),
                contributionPoints: 0
            }
        };
        
        // Deep copy ranks to prevent modification of the original template
        this.ranks = JSON.parse(JSON.stringify(defaultSectRanks));

        this.treasury = {
            spiritStones: 0
            // other resources can be added here
        };

        this.totalContributionPoints = 0;
        this.contributionLogs = []; // Logs of contributions/actions
        this.sectPower = 0; // Could be calculated based on members, treasury, etc.
    }

    getMemberRole(playerId) {
        if (this.members && this.members[playerId]) {
            return this.members[playerId].role;
        }
        return null;
    }

    hasPermission(playerId, permissionKey, sectPermissionsData = {}) {
        // sectPermissionsData would be gameData.SECT_PERMISSIONS
        const roleName = this.getMemberRole(playerId);
        if (!roleName) return false;

        const rank = this.ranks.find(r => r.name === roleName);
        if (!rank || !rank.permissions) return false;

        if (rank.permissions.includes(sectPermissionsData.ALL || "all")) return true;
        return rank.permissions.includes(permissionKey);
    }

    addMember(playerId, playerName, serverTimestampFn = null) {
        let events = [];
        if (this.members[playerId]) {
            events.push({ type: 'info', message: `${playerName} is already a member of ${this.name}.` });
            return { success: false, events };
        }

        const defaultNewMemberRank = this.ranks.find(r => r.isDefaultNewMember) || this.ranks.find(r => r.name === "Outer Disciple");
        const assignedRole = defaultNewMemberRank ? defaultNewMemberRank.name : "Outer Disciple";

        this.members[playerId] = {
            playerName: playerName,
            role: assignedRole,
            joinedAt: serverTimestampFn ? serverTimestampFn() : new Date(),
            contributionPoints: 0
        };
        events.push({ type: 'member_join', message: `${playerName} (${assignedRole}) has joined the ${this.name} sect!`, playerId, playerName, role: assignedRole });
        this.updateSectPower(); // Placeholder for power calculation
        return { success: true, events };
    }

    removeMember(playerId) {
        let events = [];
        if (this.members[playerId]) {
            const memberName = this.members[playerId].playerName || "A member";
            if (playerId === this.founderId && Object.keys(this.members).length > 1) {
                events.push({ type: 'error', message: `The founder ${memberName} cannot leave the sect while other members remain. Transfer leadership first.` });
                return { success: false, events, disbanded: false };
            }
            
            delete this.members[playerId];
            events.push({ type: 'member_leave', message: `${memberName} has left the ${this.name} sect.`, playerId, memberName });
            this.updateSectPower();

            if (Object.keys(this.members).length === 0) {
                events.push({ type: 'sect_disband', message: `Sect ${this.name} has been disbanded as the last member left.` });
                return { success: true, events, disbanded: true }; // Signal to service layer to delete from DB
            }
            return { success: true, events, disbanded: false };
        } else {
            events.push({ type: 'error', message: `Player ID ${playerId} not found in sect ${this.name}.` });
            return { success: false, events, disbanded: false };
        }
    }

    updateSectPower() {
        // Placeholder for sect power calculation logic
        // e.g., based on member count, member cultivation levels, treasury, etc.
        this.sectPower = Object.keys(this.members).length * 100 + (this.treasury.spiritStones || 0);
    }

    toFirestoreObject(serverTimestampFn = null) {
        const membersForFirestore = {};
        for (const pid in this.members) {
            const member = this.members[pid];
            membersForFirestore[pid] = {
                ...member,
                // Ensure joinedAt is a server timestamp if it's a new Date object from a non-Firestore context
                joinedAt: (member.joinedAt && member.joinedAt.toDate) ? member.joinedAt : (serverTimestampFn ? serverTimestampFn() : new Date())
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
            createdAt: (this.createdAt && this.createdAt.toDate) ? this.createdAt : (serverTimestampFn ? serverTimestampFn() : new Date()),
            buffs: this.buffs || [],
            members: membersForFirestore,
            ranks: this.ranks, // Assumes ranks structure is Firestore-compatible
            treasury: this.treasury || { spiritStones: 0 },
            totalContributionPoints: this.totalContributionPoints || 0,
            contributionLogs: (this.contributionLogs || []).slice(-50), // Store last 50 logs
            sectPower: this.sectPower || 0
        };
    }

    static fromFirestoreObject(docData, sectId, defaultSectRanks = []) {
        // Constructor doesn't take serverTimestampFn or defaultSectRanks directly anymore for static method
        const sect = new Sect(docData.name, docData.founderId, docData.founderName, sectId, docData.description, docData.motto, docData.location, docData.bannerUrl);
        
        // Assign properties from docData, ensuring defaults for missing fields
        sect.createdAt = docData.createdAt; // This will be a Firestore Timestamp
        sect.buffs = docData.buffs || [];
        sect.members = docData.members || {};
        // Deep copy ranks from the provided default or docData's ranks
        sect.ranks = JSON.parse(JSON.stringify(docData.ranks || defaultSectRanks));
        sect.treasury = docData.treasury || { spiritStones: 0 };
        sect.totalContributionPoints = docData.totalContributionPoints || 0;
        sect.contributionLogs = docData.contributionLogs || [];
        sect.sectPower = docData.sectPower || 0;
        
        // Ensure all members have playerName, role, joinedAt, contributionPoints
        for (const memberId in sect.members) {
            sect.members[memberId].playerName = sect.members[memberId].playerName || 'Unknown Member';
            sect.members[memberId].role = sect.members[memberId].role || 'Outer Disciple';
            sect.members[memberId].joinedAt = sect.members[memberId].joinedAt; // Should be Firestore Timestamp
            sect.members[memberId].contributionPoints = sect.members[memberId].contributionPoints || 0;
        }

        return sect;
    }

    logContribution(playerId, playerName, action, details, amount = 0, serverTimestampFn = null) {
        this.contributionLogs.unshift({
            playerId: playerId,
            playerName: playerName,
            action: action,
            details: details,
            amount: amount,
            timestamp: serverTimestampFn ? serverTimestampFn() : new Date()
        });
        if (this.contributionLogs.length > 100) { // Keep logs manageable
            this.contributionLogs.pop();
        }
        if (amount > 0) {
            this.totalContributionPoints = (this.totalContributionPoints || 0) + amount;
            if (this.members[playerId]) {
                this.members[playerId].contributionPoints = (this.members[playerId].contributionPoints || 0) + amount;
            }
        }
        this.updateSectPower(); // Recalculate power after contribution
    }
}

module.exports = { Sect };
