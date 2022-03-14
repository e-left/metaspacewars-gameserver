const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// user = {pubkey: string, metadata: string, highscore: int}

const createPlayer = async (player) => {
    const newPlayer = await prisma.player.create({
        data: {
            pubkey: player.pubkey,
            highscore: player.highscore,
            metadata: player.metadata,
        },
    });

    return newPlayer;
};

const getPlayers = async () => {
    let players = await prisma.player.findMany();

    return players;
};

const readPlayer = async (id) => {
    let player = await prisma.player.findMany({
        where: {
            id: id,
        },
    });

    return player;
};

const updatePlayer = async (id, player) => {
    const updatedPlayer = await prisma.player.update({
        where: {
            id: id,
        },
        data: {
            pubkey: player.pubkey,
            highscore: player.highscore,
            metadata: player.metadata,
        },
    });

    return updatedPlayer;

};

const deletePlayer = async (id) => {
    await prisma.player.delete({
        where: {
            id: id,
        },
    });

    return true;
};

const getLeaderboard = async (count, offset) => {
    const totalCount = await prisma.player.count();

    if (offset > totalCount) {
        return { error: "Bad offset" };
    }

    const toBeReturned = offset + count >= totalCount ? totalCount - offset : count;

    const players = await prisma.player.findMany({
        orderBy: [
            {
                highscore: "desc",
            },
        ],
        skip: offset,
        take: toBeReturned
    });

    return players;
}

const getRanking = async (id) => {
    const player = await readPlayer(id);
    const playerScore = player.highscore;
    const betterPlayers = await prisma.player.findMany({
        where: {
            highscore: {
                gte: playerScore,
            },
        },
    });

    return betterPlayers.length + 1;
}

const getCount = async () => {
    const count = await prisma.player.count();

    return count;
}

module.exports(createPlayer, getPlayers, readPlayer, updatePlayer, deletePlayer, getLeaderboard, getRanking, getCount);