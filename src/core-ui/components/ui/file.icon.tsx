import React, { forwardRef } from "react";

declare type fileIconProps = {
    text: any;
};
export const FileIcon = forwardRef((props: fileIconProps, _ref) => {
    return (
        <div className="reco-file-icon">
            <i className="mobile mobile-blank_file" />
            <span className="file-icon-text">{props.text}</span>
        </div>
    );
});
