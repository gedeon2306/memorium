import { CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react";

const Alert = () => {
    const handleAlert = (type: "info" | "success" | "warning" | "error", message: string) => {
        const alert = document.getElementById(`${type}-alert`);
        const messageElement = document.getElementById(`${type}-message`)
        if (alert && messageElement) {
            alert.classList.remove("hidden");
            (messageElement as HTMLElement).textContent = message;
            setTimeout(() => {
                alert.classList.add("hidden");
            }, 10000);
        }
    };

  return (
    <div className="absolute top-0 right-0 m-4 space-y-3">
        <div id="info-alert" role="alert" className="alert alert-info alert-soft hidden">
            <Info className="w-5 h-5" />
            <span id="info-message">12 unread messages. Tap to see.</span>
        </div>
        <div id="success-alert" role="alert" className="alert alert-success alert-soft hidden">
            <CircleCheck className="w-5 h-5" />
            <span id="success-message">Your purchase has been confirmed!</span>
        </div>
        <div id="warning-alert" role="alert" className="alert alert-warning alert-soft hidden">
            <TriangleAlert className="w-5 h-5" />
            <span id="warning-message">Warning: Invalid email address!</span>
        </div>
        <div id="error-alert" role="alert" className="alert alert-error alert-soft hidden">
            <CircleX className="w-5 h-5" />
            <span id="error-message">Error! Task failed successfully.</span>
        </div>
    </div>
  );
};

export default Alert;