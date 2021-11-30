import { AnyAction } from "redux";
interface MessageInstance {
    info(content: React.ReactNode, duration?: number, onClose?: () => void): void;
    success(content: React.ReactNode, duration?: number, onClose?: () => void): void;
    error(content: React.ReactNode, duration?: number, onClose?: () => void): void;
    warning(content: React.ReactNode, duration?: number, onClose?: () => void): void;
    loading(content: React.ReactNode, duration?: number, onClose?: () => void): void;
}

declare module "redux" {
    interface AnyAction {
        message?: MessageInstance;
        key?: string | string[];
    }
}
