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
        this.state = {
            settings: false,
            information: false,

            started: false,
            paused: true,
            courtesy: true,
            courtesyTimer: 1000,

            phase: 0,

            timer: {
                h: 0,
                m: 0,
                s: 0,
            },
            startTime: new Date(),
            endTime: new Date(),

            timers: {
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
            defaultTimers: [
                {
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
            ],
        };

        this.settings = this.settings.bind(this);
        this.information = this.information.bind(this);

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
        const { defaultTimers, timers, phase } = this.state;
        let initTimers = cookies.get("timer") ? cookies.get("timer") : timers;
        let timer = initTimers.timers[phase];

        window.$('[data-toggle="tooltip"]').tooltip();

        this.setState(
            {
                timer: timer,
                timers: initTimers,
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
                var currentTime = new Date();

                // (d)elta
                let dt = endTime - currentTime;
                let dtDate = new Date(dt);
                dtDate.setMinutes(dtDate.getMinutes() + dtDate.getTimezoneOffset());

                if (dt < 0) {
                    this.setState({
                        timer: {
                            h: 0,
                            m: 0,
                            s: 0,
                        },
                    });

                    window.$("#play").attr("data-original-title", "Nästa fas");
                } else {
                    this.setState({
                        timer: {
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

        //console.log("timeString :>> ", timeString);
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

    setTimerConfiguration(timer) {
        const { cookies } = this.props;

        this.setState(
            {
                timers: timer,
            },
            () => {
                cookies.set("timer", timer, { path: "/" });
                this.resetPhase();
            }
        );
    }

    resetPhase() {
        const { timers, phase } = this.state;
        let timer = timers.timers[phase];
        console.log("timer :>> ", timer);
        this.updateTime(timer);

        this.setState({
            paused: true,
            courtesy: true,

            timer: timer,
        });
    }

    nextPhase(e) {
        e.preventDefault();

        const { timer, timers, paused } = this.state;

        let { phase } = this.state;
        const isStart = JSON.stringify(timer) !== JSON.stringify(timers.timers[phase]);
        const isEnd = timer.h === 0 && timer.m === 0 && timer.s === 0;

        // isSkip is true if user changes phase while having ran
        let isSkip = isStart && !isEnd;

        // Next phase in iteration
        phase = (phase + 1) % timers.length;

        this.setState(
            {
                paused: isSkip ? true : paused,
                courtesy: true,

                phase: phase,
                timer: timers.timers[phase],
            },
            () => {
                this.updateTime(timers.timers[phase]);

                let nextPhase = timers.timers[(phase + 1) % timers.timers.length];
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

    render() {
        const { settings, information } = this.state;
        const { started, paused, timer, timers, phase } = this.state;
        let nextPhase = timers.timers[(phase + 1) % timers.timers.length];
        const isEnd = timer.h === 0 && timer.m === 0 && timer.s === 0;

        let isTimerRun = JSON.stringify(timer) !== JSON.stringify(timers.timers[phase]);

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
                                                <span className="title">{timers.timers[phase].title}</span>
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
                                                {/*this.format(timers.timers[phase])*/}
                                            </div>
                                            <div className="dontduckinglookatme">
                                                <div
                                                    className="d-inline-block"
                                                    data-toggle="tooltip"
                                                    data-placement="bottom"
                                                    title="Information"
                                                >
                                                    <button
                                                        type="button"
                                                        data-toggle="collapse"
                                                        data-target="#information"
                                                        aria-expanded="false"
                                                        aria-controls="information"
                                                        className={"btn btn-fa-icon" + (information ? " active" : "")}
                                                        onClick={this.information}
                                                    >
                                                        <FontAwesomeIcon icon={faInfoCircle} />
                                                    </button>
                                                </div>
                                                {/* 
                                            
                                            */}
                                                <div
                                                    className="d-inline-block"
                                                    data-toggle="tooltip"
                                                    data-placement="bottom"
                                                    title="Inställningar"
                                                >
                                                    <button
                                                        type="button"
                                                        data-toggle="collapse"
                                                        data-target="#settings"
                                                        aria-expanded="false"
                                                        aria-controls="settings"
                                                        className={"btn btn-fa-icon" + (settings ? " active" : "")}
                                                        onClick={this.settings}
                                                    >
                                                        <FontAwesomeIcon icon={faCog} />
                                                    </button>
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
                                                onClick={this.information}
                                                type="button"
                                                data-toggle="collapse"
                                                data-target="#information"
                                                aria-expanded="false"
                                                aria-controls="settings"
                                            >
                                                Inställningar
                                            </button>
                                            <Extrapolate info={"Inställningar sparas i dina cookies"} />
                                            <p className="easy-eyes">
                                                Detta projekt är WIP
                                                <Extrapolate info={"Work In Progress"} /> vilket betyder att mycket av
                                                utseendet kan komma att förändras.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12">
                                            <div>
                                                <span className="mb-1">Timers</span>
                                                <p> </p>
                                            </div>

                                            <div className="row">
                                                {this.state.defaultTimers.map((x, i) => {
                                                    return (
                                                        <div key={i} className="col-auto">
                                                            <button
                                                                className={
                                                                    "btn btn-default btn-sm" +
                                                                    (timers.name === x.name ? " active" : "")
                                                                }
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    this.setTimerConfiguration(x);
                                                                }}
                                                            >
                                                                {x.name}
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="information" className="row collapse multi-collapse mt-5">
                                <div className="col-12">
                                    <div className="row">
                                        <div className="col-12">
                                            <div>
                                                <span className="mb-1">Om hemsidan</span>
                                                <p>
                                                    Denna hemsidan är byggd i Express & React. Ikonerna är{" "}
                                                    <a href="https://fontawesome.com/" target="_blank">
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
