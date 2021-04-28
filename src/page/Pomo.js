import React, { Component } from "react";

import WatchFace from "../components/Pomo/WatchFace.js";
import Extrapolate from "../components/Extrapolate.js";

import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog, faInfoCircle } from "@fortawesome/free-solid-svg-icons";

class Pomo extends Component {
    constructor(props) {
        super(props);
        const { cookies } = this.props;

        this.state = {
            settings: false,
            information: false,
            customTimerEdit: false,

            started: false,
            paused: true,
            courtesy: true,
            courtesyTimer: 1000,

            phase: 0,

            timer: {
                title: "",
                h: 0,
                m: 0,
                s: 0,
            },
            startTime: new Date(),
            endTime: new Date(),

            chosenTimer: {
                name: "Default 45:15",
                id: 0,
                timers: [
                    {
                        title: "Studera",
                        h: 0,
                        m: 45,
                        s: 0,
                    },
                    {
                        title: "Paus",
                        h: 0,
                        m: 15,
                        s: 0,
                    },
                ],
            },
            timers: [
                {
                    id: 0,
                    name: "Default 45:15",
                    timers: [
                        {
                            title: "Studera",
                            h: 0,
                            m: 45,
                            s: 0,
                        },
                        {
                            title: "Paus",
                            h: 0,
                            m: 15,
                            s: 0,
                        },
                    ],
                },
                {
                    id: 1,
                    name: "Traditionell 25:5",
                    timers: [
                        {
                            title: "Studera",
                            h: 0,
                            m: 25,
                            s: 0,
                        },
                        {
                            title: "Paus",
                            h: 0,
                            m: 5,
                            s: 0,
                        },
                    ],
                },
                {
                    id: 2,
                    name: "Custom",
                    timers: cookies.get("timer-custom")
                        ? cookies.get("timer-custom")
                        : [
                              {
                                  title: "Studera",
                                  h: 0,
                                  m: 0,
                                  s: 0,
                              },
                              {
                                  title: "Paus",
                                  h: 0,
                                  m: 0,
                                  s: 0,
                              },
                          ],
                },
            ],

            customTimerField: "",
        };

        this.settings = this.settings.bind(this);
        this.information = this.information.bind(this);

        this.start = this.start.bind(this);
        this.pause = this.pause.bind(this);

        this.resetPhase = this.resetPhase.bind(this);
        this.nextPhase = this.nextPhase.bind(this);

        this.updateTime = this.updateTime.bind(this);
        this.tick = this.tick.bind(this);

        this.saveCustomTimer = this.saveCustomTimer.bind(this);
        this.resetCustomTimer = this.resetCustomTimer.bind(this);
    }

    componentDidMount() {
        const { cookies } = this.props;
        const { timers, phase } = this.state;
        let initTimers = cookies.get("timer") ? cookies.get("timer") : timers[0];
        let timer = initTimers.timers[phase];

        window.$('[data-toggle="tooltip"]').tooltip();

        this.setState(
            {
                timer: timer,
                chosenTimer: initTimers,
                customTimerField: cookies.get("timer-custom")
                    ? JSON.stringify(cookies.get("timer-custom"), null, 2)
                    : JSON.stringify(initTimers.timers, null, 2),
            },
            () => {
                setInterval(this.tick, 100);
            }
        );
    }

    tick() {
        let self = this;
        const { endTime, started, paused, timer, courtesy, courtesyTimer } = this.state;

        if (courtesy) {
            setTimeout(() => {
                if (self.state.courtesy) {
                    self.setState({
                        courtesy: false,
                    });

                    this.updateTime(timer);
                }
            }, courtesyTimer);
        } else {
            if (started && !paused) {
                const { title } = timer;
                var currentTime = new Date();

                // (d)elta
                let dt = endTime - currentTime;
                let dtDate = new Date(dt);
                dtDate.setMinutes(dtDate.getMinutes() + dtDate.getTimezoneOffset());

                if (dt < 0) {
                    this.setState({
                        timer: {
                            title,
                            h: 0,
                            m: 0,
                            s: 0,
                        },
                    });

                    window.$("#play").attr("data-original-title", "Nästa fas");
                } else {
                    this.setState({
                        timer: {
                            title,
                            h: dtDate.getHours(),
                            m: dtDate.getMinutes(),
                            s: dtDate.getSeconds(),
                        },
                    });
                }
            }
        }
    }

    start(e) {
        e.preventDefault();
        const { timer } = this.state;

        this.updateTime(timer);

        this.setState({
            started: true,
            courtesy: true,

            paused: false,
        });
    }

    pause(e) {
        e.preventDefault();
        const { timer } = this.state;

        this.updateTime(timer);

        this.setState({
            paused: true,
            courtesy: true,
        });
    }

    setTimerConfiguration(id_timer) {
        const { cookies } = this.props;
        const { timers } = this.state;

        for (let i = 0; i < timers.length; i++) {
            const timer = timers[i];

            if (id_timer === timer.id) {
                this.setState(
                    {
                        chosenTimer: timer,
                    },
                    () => {
                        cookies.set("timer", timer, { path: "/", maxAge: 60 * 60 * 24 * 183 });
                        this.resetPhase();
                    }
                );
                break;
            }
        }
    }

    resetPhase() {
        const { chosenTimer, phase } = this.state;
        let timer = chosenTimer.timers[phase];

        this.updateTime(timer);

        this.setState({
            paused: true,
            courtesy: true,

            timer: timer,
        });
    }

    nextPhase(e) {
        e.preventDefault();

        const { timer, chosenTimer, paused } = this.state;

        let { phase } = this.state;
        const isStart = JSON.stringify(timer) !== JSON.stringify(chosenTimer.timers[phase]);
        const isEnd = timer.h === 0 && timer.m === 0 && timer.s === 0;

        // isSkip is true if user changes phase while having ran
        let isSkip = isStart && !isEnd;

        // Next phase in iteration
        phase = (phase + 1) % chosenTimer.timers.length;

        this.setState(
            {
                paused: isSkip ? true : paused,
                courtesy: true,

                phase: phase,
                timer: chosenTimer.timers[phase],
            },
            () => {
                this.updateTime(chosenTimer.timers[phase]);

                let nextPhase = chosenTimer.timers[(phase + 1) % chosenTimer.timers.length];
                window.$("#phase").attr("data-original-title", "Nästa fas: " + nextPhase.title);
                window.$("#play").attr("data-original-title", "");

                window.$('[data-toggle="tooltip"]').tooltip();
            }
        );
    }

    updateTime(timer) {
        var currentTime = new Date();
        var endTime = currentTime;

        endTime.setHours(currentTime.getHours() + timer.h);
        endTime.setMinutes(currentTime.getMinutes() + timer.m);
        endTime.setSeconds(currentTime.getSeconds() + timer.s);

        this.setState({
            startTime: currentTime,
            endTime: endTime,
        });
    }

    settings(e) {
        e.preventDefault();
        const { settings } = this.state;

        this.setState({
            settings: !settings,
        });
    }

    information(e) {
        e.preventDefault();
        const { information } = this.state;
        window.$('[data-toggle="tooltip"]').tooltip();

        this.setState({
            information: !information,
        });
    }

    resetCustomTimer(e) {
        e.preventDefault();
        const { cookies } = this.props;
        const { timers } = this.state;
        let reset = timers[0].timers;

        cookies.set("timer-custom", JSON.stringify(reset, null, 2), {
            path: "/",
            maxAge: 60 * 60 * 24 * 183,
        });
        this.setState({ customTimerField: JSON.stringify(reset, null, 2) });
    }

    saveCustomTimer(e) {
        let self = this;
        e.preventDefault();
        const { cookies } = this.props;
        const { timers, customTimerField } = this.state;
        const customTimerIndex = timers.length - 1;

        let newTimers = timers;
        const newCustomTimer = JSON.parse(customTimerField);

        newTimers[customTimerIndex].timers = newCustomTimer;
        cookies.set("timer-custom", JSON.stringify(newTimers[customTimerIndex].timers, null, 2), {
            path: "/",
            maxAge: 60 * 60 * 24 * 183,
        });

        this.setState({ timers: newTimers }, () => {
            self.setTimerConfiguration(newTimers[customTimerIndex].id);
        });
    }

    render() {
        // Watchface
        const { settings, information } = this.state;
        const { started, paused, timer, phase } = this.state;

        // Rest
        const { timers } = this.state;
        const { chosenTimer, customTimerField } = this.state;

        const customTimerIndex = timers.length - 1;
        const customTimer = timers[customTimerIndex];
        const isCustom = chosenTimer.id === customTimer.id;

        return (
            <div id="pomo">
                <div className="container th d-flex align-items-center justify-content-center nav-padding">
                    <div className="row mb-3">
                        <div id="wrap-app" className="col-auto">
                            <div className="row">
                                <div className="col-12">
                                    <WatchFace
                                        timers={timers}
                                        chosenTimer={chosenTimer}
                                        phase={phase}
                                        timer={timer}
                                        started={started}
                                        paused={paused}
                                        start={this.start}
                                        pause={this.pause}
                                        resetPhase={this.resetPhase}
                                        nextPhase={this.nextPhase}
                                    >
                                        <div
                                            className="d-inline-block"
                                            data-toggle="tooltip"
                                            data-placement="bottom"
                                            title="Information"
                                        >
                                            <div
                                                data-toggle="collapse"
                                                data-target="#information"
                                                aria-expanded="false"
                                                aria-controls="information"
                                                className={"btn btn-fa-icon" + (information ? " active" : "")}
                                                onClick={this.information}
                                            >
                                                <FontAwesomeIcon icon={faInfoCircle} />
                                            </div>
                                        </div>
                                        {/* 
                                            
                                            */}
                                        <div
                                            className="d-inline-block"
                                            data-toggle="tooltip"
                                            data-placement="bottom"
                                            title="Inställningar"
                                        >
                                            <div
                                                data-toggle="collapse"
                                                data-target="#settings"
                                                aria-expanded="false"
                                                aria-controls="settings"
                                                className={"btn btn-fa-icon" + (settings ? " active" : "")}
                                                onClick={this.settings}
                                            >
                                                <FontAwesomeIcon icon={faCog} />
                                            </div>
                                        </div>
                                    </WatchFace>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-12">
                                    <div id="settings" className="collapse multi-collapse mt-4">
                                        <div className="row">
                                            <div className="col-12">
                                                <button
                                                    className="btn btn-text"
                                                    onClick={this.settings}
                                                    type="button"
                                                    data-toggle="collapse"
                                                    data-target="#settings"
                                                    aria-expanded="false"
                                                    aria-controls="settings"
                                                >
                                                    Inställningar
                                                </button>
                                                <p>
                                                    Detta projekt är WIP
                                                    <Extrapolate info={"Work In Progress"}></Extrapolate> vilket betyder
                                                    att mycket av utseendet kan komma att förändras.
                                                </p>
                                                <p>Inställningar lagras i dina kakor.</p>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-12">
                                                <div className="row">
                                                    <div className="col-12">
                                                        <span className="mb-1">Timers</span>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    {timers.map((x, i) => {
                                                        return (
                                                            <div key={i} className="col-auto">
                                                                <button
                                                                    className={
                                                                        "btn btn-default btn-sm mt-3" +
                                                                        (chosenTimer.name === x.name ? " active" : "")
                                                                    }
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        this.setTimerConfiguration(x.id);
                                                                    }}
                                                                >
                                                                    {x.name}
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                <div
                                                    id="customTimerEdit"
                                                    className={"transition overflow-hidden row"}
                                                    style={{ maxHeight: isCustom ? " 9999px" : "0px" }}
                                                >
                                                    <div className="col-12 mt-3">
                                                        <div className="row">
                                                            <div className="col-12">
                                                                <span></span>
                                                                <p>Konstruera din egen timer med hjälp av JSON!</p>
                                                                <textarea
                                                                    className="w-100 mb-3"
                                                                    style={{
                                                                        maxHeight: "43.2rem",
                                                                        minHeight: "21.6rem",
                                                                    }}
                                                                    value={customTimerField}
                                                                    onChange={(e) => {
                                                                        e.preventDefault();
                                                                        let value = e.currentTarget.value;

                                                                        this.setState({
                                                                            customTimerField: value,
                                                                        });
                                                                    }}
                                                                ></textarea>

                                                                <button
                                                                    onClick={this.saveCustomTimer}
                                                                    className="btn btn-default btn-sm active mr-2"
                                                                >
                                                                    Ladda in
                                                                </button>
                                                                <button
                                                                    onClick={this.resetCustomTimer}
                                                                    className="btn btn-default btn-sm"
                                                                >
                                                                    Återställ
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row justify-content-center">
                                <div className="col-12">
                                    <div id="information" className="collapse multi-collapse mt-4">
                                        <div className="row">
                                            <div className="col-12">
                                                <div className="mb-4">
                                                    <button
                                                        className="btn btn-text"
                                                        onClick={this.settings}
                                                        type="button"
                                                        data-toggle="collapse"
                                                        data-target="#information"
                                                        aria-expanded="false"
                                                        aria-controls="settings"
                                                    >
                                                        Om hemsidan
                                                    </button>
                                                    <p>
                                                        Denna hemsidan är byggd i Express & React. Ikonerna är{" "}
                                                        <a
                                                            href="https://fontawesome.com/"
                                                            rel="noopener noreferrer"
                                                            target="_blank"
                                                        >
                                                            Font Awesome
                                                        </a>
                                                        .
                                                    </p>
                                                </div>
                                                <div>
                                                    <label>Kakor</label>
                                                    <p>
                                                        På denna webbplats används kakor. En kaka är en kort text som
                                                        lagras i din webbläsare.
                                                    </p>
                                                    <p>
                                                        Denna webbplats använder Google Analytics för att följa upp
                                                        trafiken på webbplatsen i syfte att förbättra innehåll,
                                                        navigation och struktur. Vid första kontakt med webbservern så
                                                        lagras en cookie i din webbläsare, som sedan läses av
                                                        webbservern vid varje kontakt. Därmed kan webbservern känna igen
                                                        din webbläsare.{" "}
                                                        <a
                                                            href="http://www.minacookies.se/"
                                                            rel="noopener noreferrer"
                                                            target="_blank"
                                                        >
                                                            Läs mer om kakor och hur du tar bort dem.
                                                        </a>
                                                    </p>
                                                </div>
                                                <div className="mb-4" style={{ overflow: "auto" }}>
                                                    <table>
                                                        <caption>Kakor som är väsentliga för appens funktion.</caption>
                                                        <thead>
                                                            <tr className="border-bottom">
                                                                <th className="font-weight-normal">Namn</th>
                                                                <th className="px-3 font-weight-normal">Utgångstid</th>
                                                                <th className="font-weight-normal">Beskrivning</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>scookies</td>
                                                                <td className="px-3">6 månader</td>
                                                                <td>
                                                                    Används för att underrätta användaren om att kakor
                                                                    används på sidan
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>timer</td>
                                                                <td className="px-3">6 månader</td>
                                                                <td>
                                                                    Används för att lagra användarens tillstånd vid
                                                                    användning av timern
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>timer-custom</td>
                                                                <td className="px-3">6 månader</td>
                                                                <td>
                                                                    Används för att lagra användarens anpassade timer
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="mb-4" style={{ overflow: "auto" }}>
                                                    <table>
                                                        <caption>
                                                            Kakor som används för användaranalys,{" "}
                                                            <a
                                                                href="https://developers.google.com/analytics/devguides/collection/gajs/cookie-usage#gtagjs_google_analytics_4_-_cookie_usage"
                                                                rel="noopener noreferrer"
                                                                target="_blank"
                                                            >
                                                                Google Analytics
                                                            </a>{" "}
                                                            (2021-04-25).{" "}
                                                            <a
                                                                href="https://support.google.com/analytics/answer/6004245"
                                                                rel="noopener noreferrer"
                                                                target="_blank"
                                                            >
                                                                Läs mer
                                                            </a>
                                                        </caption>
                                                        <thead>
                                                            <tr className="border-bottom">
                                                                <th className="font-weight-normal">Namn</th>
                                                                <th className="px-3 font-weight-normal">Utgångstid</th>
                                                                <th className="font-weight-normal">Beskrivning</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>_ga</td>
                                                                <td className="px-3">2 år</td>
                                                                <td>
                                                                    Används för att känna igen, och skilja på, användare
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>_gid</td>
                                                                <td className="px-3">24 timmar</td>
                                                                <td>
                                                                    Används för att lagra användarens tillstånd vid
                                                                    användning av timern
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>{"_ga_<container-id>"}</td>
                                                                <td className="px-3">2 år</td>
                                                                <td>Används för att hålla session tillstånd</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/*
                        <div className="row d-flex justify-content-center">
                            <div className="col-8">
                                <div className="row">
                                    <div className="col-12 ">
                                        <div className="row">
                                            <div className="col d-flex">
                                                <div>Arbete</div>
                                                <div className="easy-eyes">asdasd</div>
                                            </div>
                                            <div className="col-auto d-flex">
                                                <h1>00:45:00</h1>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        */}
                </div>
            </div>
        );
    }
}

export default Pomo;
