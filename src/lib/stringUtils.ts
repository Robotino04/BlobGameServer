function capitalize(str: string) {
    if (str.length == 0) return str;
    return str[0].toUpperCase() + str.substr(1);
}

export function titleCase(str: string) {
    return str.split(' ').map(capitalize).join(' ');
}