export const NameConstraint = (text) => {
    if (!text || typeof text !== 'string') {
        return ""
    }
    return text.substring(0, 15);
}