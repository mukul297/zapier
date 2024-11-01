import express from "express";
import { PrismaClient } from '@prisma/client'

const app = express();
const client = new PrismaClient();
app.use(express.json());

app.post("/hooks/catch/:userId/:zapId", async (req, res) => {
    const userId = req.params.userId;
    const zapId = req.params.zapId;
    const body = req.body;

    await client.$transaction(async tx => {
        // store it in db to a new trigger
        const run = await tx.zapRun.create({
            data: {
                zapId: zapId, 
                metadata: body
            }
        })

        await tx.zapRunOutbox.create({
            data: {
                zapRunId: run.id,
            }
        })
        
    })
    res.json({
        message: "Webhook recieved"
    })
    // push it on the queue (kafka/redis)
})

app.listen(3000)