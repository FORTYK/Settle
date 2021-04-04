import React, { Component } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlayCircle,
    faPauseCircle,
    faCog,
    faInfoCircle,
    faUndo,
    faStepForward,
    //faForward,
} from "@fortawesome/free-solid-svg-icons";

import Extrapolate from "../components/Extrapolate.js";

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

        this.saveCustomTimer = this.saveCustomTimer.bind(this);
        this.resetCustomTimer = this.resetCustomTimer.bind(this);

        this.resetPhase = this.resetPhase.bind(this);
        this.nextPhase = this.nextPhase.bind(this);

        this.start = this.start.bind(this);
        this.pause = this.pause.bind(this);

        this.updateTime = this.updateTime.bind(this);

        this.tick = this.tick.bind(this);
    }

    componentDidMount() {
        // Temp
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

    format(t) {
        //(t)imer

        let formatT = {
            h: t.h < 10 ? "0" + t.h : t.h,
            m: t.m < 10 ? "0" + t.m : t.m,
            s: t.s < 10 ? "0" + t.s : t.s,
        };

        return formatT.h + ":" + formatT.m + ":" + formatT.s;
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

        this.setState({
            information: !information,
        });
    }

    loadCustom(e) {
        e.preventDefault();
        const { timers } = this.state;
        const custom = timers[timers.length - 1];
    }

    resetCustomTimer(e) {
        e.preventDefault();
        let self = this;
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
        const customTimer = timers[customTimerIndex];

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
        const { settings, information, timers } = this.state;
        const { started, paused, timer, chosenTimer, phase, customTimerField } = this.state;

        let nextPhase = chosenTimer.timers[(phase + 1) % chosenTimer.timers.length];

        const customTimerIndex = timers.length - 1;
        const customTimer = timers[customTimerIndex];
        const isCustom = chosenTimer.id === customTimer.id;

        const isEnd = timer.h === 0 && timer.m === 0 && timer.s === 0;

        let isTimerRun = JSON.stringify(timer) !== JSON.stringify(chosenTimer.timers[phase]);

        return (
            <div id="pomo">
                <div className="container th d-flex align-items-center justify-content-center ">
                    <div className="row mb-3">
                        <div className="col-auto">
                            <div className="row">
                                <div className="col">
                                    <div id="watch">
                                        <div className="d-flex justify-content-between forehead easy-eyes">
                                            <div className="d-flex align-items-center">
                                                <span className="title">{chosenTimer.timers[phase].title}</span>
                                                <button
                                                    className={
                                                        "btn btn-fa-icon undo ml-1" + (isTimerRun ? "" : " d-none")
                                                    }
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        this.resetPhase();
                                                    }}
                                                    data-toggle="tooltip"
                                                    data-placement="right"
                                                    title={"Starta om fas"}
                                                >
                                                    <FontAwesomeIcon icon={faUndo} />
                                                </button>
                                                <button
                                                    id="phase"
                                                    className="btn btn-fa-icon"
                                                    onClick={this.nextPhase}
                                                    data-toggle="tooltip"
                                                    data-placement="bottom"
                                                    title={"Nästa fas: " + nextPhase.title}
                                                >
                                                    <FontAwesomeIcon icon={faStepForward} />
                                                </button>
                                                {/*this.format(chosenTimer.timers[phase])*/}
                                            </div>
                                            <div className="dontduckinglookatme">
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
                                            </div>
                                        </div>
                                        <div className="d-flex d-flex justify-content-between face easy-eyes">
                                            <span className="align-middle">{this.format(timer)}</span>
                                            <div className="d-flex align-items-center">
                                                <button
                                                    id="play"
                                                    type="button"
                                                    data-toggle="tooltip"
                                                    data-placement="bottom"
                                                    title=""
                                                    className={
                                                        "btn btn-fa-icon play" + (isEnd && started ? " pulse" : "")
                                                    }
                                                    onClick={
                                                        started && isEnd
                                                            ? this.nextPhase
                                                            : paused
                                                            ? this.start
                                                            : this.pause
                                                    }
                                                >
                                                    <FontAwesomeIcon
                                                        icon={
                                                            (started && isEnd) || paused ? faPlayCircle : faPauseCircle
                                                        }
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div id="settings" className="row collapse multi-collapse mt-5">
                                <div className="col-12">
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
                                                <Extrapolate info={"Work In Progress"} /> vilket betyder att mycket av
                                                utseendet kan komma att förändras.
                                            </p>
                                            <p>
                                                Inställningar lagras i dina kakor. Kakorna lagras i upp till 6 månader
                                                från den tidpunkt du senast var inne på hemsidan.asdasd
                                            </p>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="row">
                                                <div className="col-12">
                                                    <span className="mb-1">Timers</span>
                                                    <p> </p>
                                                </div>
                                            </div>

                                            <div className="row">
                                                {timers.map((x, i) => {
                                                    return (
                                                        <div key={i} className="col-auto">
                                                            <button
                                                                className={
                                                                    "btn btn-default btn-sm" +
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
                                                className={"transition overflow-hidden row mt-5"}
                                                style={{ maxHeight: isCustom ? " 9999px" : "0px" }}
                                            >
                                                <div className="col-12">
                                                    <div className="row">
                                                        <div className="col-12">
                                                            <span className="mb-1"></span>
                                                            <p>Konstruera din egen timer med hjälp av JSON!</p>
                                                            <textarea
                                                                className="w-100"
                                                                style={{ maxHeight: "43.2rem", minHeight: "21.6rem" }}
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
                            <div id="information" className="row collapse multi-collapse mt-5">
                                <div className="col-12">
                                    <div className="row">
                                        <div className="col-12">
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
                                            <p>Cookies används för att lagra användarens inställningar.</p>
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
