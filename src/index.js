import React from "react";
import { render } from "react-dom";

import "./index.css";
import PatternLock from "react-pattern-lock";

class Lock extends React.Component {
    state = {
        path: [],
        isLoading: false,
        error: false,
        success: false,
        disabled: false,
        size: 3,
        triesLeft: 5,
        toggle: false,
        finalState: "locked",
        timerOn: false,
    };

    errorTimeout = 0;
    promptTimeout = 0;
    timer = 0;

    onReset = () => {
        this.setState({
            isLoading: false,
            disabled: false,
            success: false,
            error: false,
            path: [],
            triesLeft: 5,
            toggle: false,
            finalState: "locked",
        });
    };

    onForgot = () => {
        this.promptTimeout = window.setTimeout(() => {
            let forgotAnswer = prompt("What is '40' + '50'?");
            if (forgotAnswer === "4050") {
                clearInterval(this.timer);
                clearTimeout(this.errorTimeout);
                this.setState({ timerOn: false });
                this.message("Forgot reset successfull!", "success");
                this.onReset();
                localStorage.removeItem("temp_pattern");
                localStorage.removeItem("pattern");
                localStorage.removeItem("final_state");
                this.setState({ finalState: "restart" });
            } else {
                if (!this.state.timerOn)
                    this.message("Incorrect security answer!");
            }
        }, 100);
    };

    disableTimer = () => {
        this.setState({ timerOn: true });
        let time = 30;
        document.getElementById(
            "message"
        ).innerText = `You can try again in ${time} seconds`;
        document.getElementById("message").style.color = "#e62121";
        document.getElementById("message").style.display = "block";
        this.timer = setInterval(() => {
            document.getElementById(
                "message"
            ).innerText = `You can try again in ${time - 1} seconds`;
            time = time - 1;
            console.log("doing");
        }, 1000);
        this.errorTimeout = window.setTimeout(() => {
            document.getElementById("message").style.display = "none";
            this.onReset();
            clearInterval(this.timer);
            this.setState({ timerOn: false });
        }, 30000);
    };

    message = (text, type) => {
        document.getElementById("message").innerText = text;
        document.getElementById("message").style.color =
            type === "success" ? "#17a70a" : "#e62121";
        document.getElementById("message").style.display = "block";

        if (text !== "UNLOCKED!") {
            this.errorTimeout = window.setTimeout(() => {
                document.getElementById("message").style.display = "none";
            }, 1000);
        }
    };

    onChange = (path) => {
        this.setState({ path: [...path] });
    };

    save = () => {
        if (localStorage.getItem("pattern")) {
        } else {
            if (localStorage.getItem("temp_pattern")) {
                if (this.state.path.length !== 0) {
                    if (
                        this.state.path.join(",") ===
                        localStorage.getItem("temp_pattern")
                    ) {
                        this.message("Pattern successfully set!", "success");
                        this.setState({ success: true });
                        this.errorTimeout = window.setTimeout(() => {
                            localStorage.setItem("pattern", this.state.path);
                            this.setState({
                                disabled: false,
                                isLoading: false,
                                success: false,
                                path: [],
                            });
                        }, 1000);
                    } else {
                        this.message("Pattern is incorrect!", "error");
                        this.setState({ error: true });
                        this.errorTimeout = window.setTimeout(() => {
                            localStorage.removeItem("temp_pattern");
                            this.onReset();
                        }, 1000);
                        setTimeout(() => {
                            if (this.state.path.length === 0) {
                                document
                                    .getElementById("confirm-button")
                                    .classList.add("disabled");
                            } else {
                                document
                                    .getElementById("confirm-button")
                                    .classList.remove("disabled");
                            }
                        }, 1001);
                    }
                }
            } else {
                if (this.state.path.length !== 0) {
                    localStorage.setItem("temp_pattern", this.state.path);
                    this.setState({
                        disabled: false,
                        isLoading: false,
                        path: [],
                    });
                    setTimeout(() => {
                        if (this.state.path.length === 0) {
                            document
                                .getElementById("verify-button")
                                .classList.add("disabled");
                        } else {
                            document
                                .getElementById("verify-button")
                                .classList.remove("disabled");
                        }
                    }, 1);
                }
            }
        }
    };

    onFinish = () => {
        this.setState({ isLoading: true, disabled: true });
        setTimeout(() => {
            if (localStorage.getItem("pattern")) {
                if (
                    this.state.path.join(",") ===
                    localStorage.getItem("pattern")
                ) {
                    if (this.state.finalState === "reset") {
                        this.message("Reset pattern successful!", "success");
                        this.setState({
                            success: true,
                        });
                        this.errorTimeout = window.setTimeout(() => {
                            this.onReset();
                        }, 1000);
                        localStorage.removeItem("temp_pattern");
                        localStorage.removeItem("pattern");
                        localStorage.removeItem("final_state");
                    } else {
                        this.message("UNLOCKED!", "success");
                        this.setState({
                            success: true,
                            finalState: "unlocked",
                        });
                        this.errorTimeout = window.setTimeout(() => {
                            this.setState({
                                success: false,
                                path: [],
                            });
                        }, 1000);
                    }
                } else {
                    if (this.state.finalState === "reset") {
                        this.message("Incorrect pattern!", "error");
                        this.setState({ error: true, finalState: "locked" });
                        this.errorTimeout = window.setTimeout(() => {
                            this.setState({
                                disabled: false,
                                isLoading: false,
                                error: false,
                                path: [],
                            });
                        }, 1000);
                    } else {
                        if (this.state.triesLeft > 1) {
                            this.message("Try again!", "error");
                            this.setState({
                                error: true,
                                triesLeft: this.state.triesLeft - 1,
                            });
                            this.errorTimeout = window.setTimeout(() => {
                                this.setState({
                                    disabled: false,
                                    isLoading: false,
                                    error: false,
                                    path: [],
                                });
                            }, 1000);
                        } else {
                            this.disableTimer();
                            this.setState({ error: true });
                            this.errorTimeout = window.setTimeout(() => {
                                this.setState({
                                    error: false,
                                    path: [],
                                });
                            }, 1000);
                        }
                    }
                }
            } else {
                if (localStorage.getItem("temp_pattern")) {
                    if (this.state.path.length === 0) {
                        document
                            .getElementById("verify-button")
                            .classList.add("disabled");
                    } else {
                        document
                            .getElementById("verify-button")
                            .classList.remove("disabled");
                    }
                } else {
                    if (this.state.path.length === 0) {
                        document
                            .getElementById("confirm-button")
                            .classList.add("disabled");
                    } else {
                        document
                            .getElementById("confirm-button")
                            .classList.remove("disabled");
                    }
                }
            }
        }, 200);
    };

    render() {
        const { size, path, disabled, success, error, isLoading } = this.state;
        return (
            <React.Fragment>
                <div className="message shake" id="message"></div>

                {this.state.finalState === "reset" ? (
                    <div className="placeholder1">Enter Current Pattern</div>
                ) : localStorage.getItem("pattern") ? (
                    <div className="placeholder1">Enter Pattern</div>
                ) : localStorage.getItem("temp_pattern") ? (
                    <div className="placeholder1">Confirm Pattern</div>
                ) : this.state.finalState === "restart" ? (
                    <div className="placeholder1">Reset Pattern</div>
                ) : (
                    <div className="placeholder1">Set Pattern</div>
                )}

                <div className="lock" id="lock">
                    <PatternLock
                        size={size}
                        onChange={this.onChange}
                        path={path}
                        error={error}
                        onFinish={this.onFinish}
                        connectorThickness={5}
                        disabled={disabled || isLoading}
                        success={success}
                    />
                </div>
                {localStorage.getItem("pattern") ? (
                    <button
                        className="placeholder2"
                        onClick={() => {
                            this.setState({ toggle: !this.state.toggle });
                        }}
                    >
                        Options
                    </button>
                ) : localStorage.getItem("temp_pattern") ? (
                    <button
                        className="placeholder2 disabled"
                        id="verify-button"
                        onClick={this.save}
                    >
                        Verify
                    </button>
                ) : (
                    <button
                        className="placeholder2 disabled"
                        id="confirm-button"
                        onClick={this.save}
                    >
                        Confirm Pattern
                    </button>
                )}

                {this.state.toggle && (
                    <div className="options">
                        {this.state.finalState !== "unlocked" && (
                            <button
                                className="placeholder2 hover"
                                onClick={() => {
                                    this.setState({
                                        finalState: "forgot",
                                        toggle: !this.state.toggle,
                                    });
                                    this.onForgot();
                                }}
                            >
                                Forgot pattern
                            </button>
                        )}
                        {!this.state.timerOn && (
                            <button
                                className="placeholder2 hover"
                                onClick={() => {
                                    this.setState({
                                        finalState: "reset",
                                        disabled: false,
                                        isLoading: false,
                                        toggle: !this.state.toggle,
                                    });
                                }}
                            >
                                Reset pattern
                            </button>
                        )}
                    </div>
                )}
            </React.Fragment>
        );
    }
}

render(<Lock />, document.getElementById("root"));
