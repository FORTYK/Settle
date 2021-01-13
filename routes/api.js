const express = require("express");
var cookie = require("cookie");
const { send } = require("process");
const router = express.Router();

fs = require("fs");
const file = "./stub/poll.js";

router.post("/poll/vote", async (req, res, next) => {
    const { body } = req;

    let fc = fs.readFileSync(file).toString();
    fc = JSON.parse(fc);

    let voted = req.cookies.poll !== undefined ? JSON.parse(req.cookies.poll) : { value: false };
    if (voted && voted.value) {
        return res.send({
            success: false,
            error: {
                title: "Error",
                description: "You can not vote on the same poll twice",
            },
        });
    }

    let found = false;
    for (let i = 0; i < fc.options.length; i++) {
        const element = fc.options[i];
        if (element.id == body.option) {
            (fc.options[i].votes += 1), (found = true);
        }
    }

    if (!found) {
        return res.send({
            success: false,
            error: {
                title: "Error",
                description: "You can not vote for that option",
            },
        });
    }

    res.cookie(
        "poll",
        JSON.stringify({
            value: true,
            option: body.option,
        }),
        { maxAge: 900000, httpOnly: true }
    );

    fs.writeFileSync(file, JSON.stringify(fc));

    return res.send({
        success: true,
    });
});

router.get("/poll/:id", (req, res) => {
    const { id } = req.params;
    let fc = fs.readFileSync(file).toString();
    fc = JSON.parse(fc);

    let response = {
        success: false,
        error: {
            title: "Could not retrieve poll",
            description: "The requested poll was not found",
        },
    };

    if (fc.id == id) {
        response.success = true;
        response.data = {
            id: fc.id,
            question: fc.question,
            options: fc.options,
        };
        response.error = null;
        let pollCookie = req.cookies.poll;
        console.log("pollCookie :>> ", pollCookie);
        response.data.voted = pollCookie !== undefined ? JSON.parse(pollCookie) : { value: false };
    }

    return res.status(200).send(response).end();
});

module.exports = router;
