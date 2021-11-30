export function getDefaultProps() {
    return {
        listType: "text",
        multiple: true,
        customUpload: false,
    };
}

export function getPictureDefaultProps() {
    return {
        listType: "picture-card",
        accept: "image/*",
        multiple: true,
        customUpload: false,
    };
}
