import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./styles/Error.css";

import ProgressBar from "./components/ProgressBar";
import Footer from "./components/Footer";

function Error() {
    const navigate = useNavigate();
    const totalSeconds = 5;

    const [seconds, setSeconds] = useState(totalSeconds);

    useEffect(() => {
        if(seconds === 0) {
            navigate("/");
            return;
        }

        const timeout = setTimeout(() => {
            setSeconds(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timeout);
    }, [seconds, navigate]);

    const elapsed = totalSeconds - seconds;
    const percentage = (elapsed / totalSeconds) * 100;

    const handleGoHome = () => {
        navigate("/");
    }

    return (
        <>
            <main id="main-error">
                <h1>Oops! Something Went Wrong</h1>
                <p>We encountered an unexpected error while processing your request.</p>
                
                <div>
                    <div id="redirect-box">
                        <div id="redirect-box-info">
                            <img src="./images/home.svg" alt="Home" />
                            <h3>Automatic Redirect</h3>
                        </div>

                        <p>You will be automatically redirect to the home page in:</p>

                        <h3><span>{ seconds > 0 ? seconds : "1" }</span> second(s)</h3>

                        <ProgressBar
                            percentage={ percentage }
                            height={ 10 }
                        />
                    </div>

                    <button onClick={ handleGoHome }>Go home now</button>
                </div>
            </main>

            <Footer />
        </>
    );
}

export default Error;