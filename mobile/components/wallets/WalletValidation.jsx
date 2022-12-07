const NumberInputValidation = (text) =>{
    if (!text || typeof text !== 'string') {
        return ""
    }
    text = text.replace(/[^\d.-]/g, '');
    let splitText = text.split('.');
    text = splitText.shift() + (splitText.length ? '.' + splitText[0].slice(0, text.length) : '');
    for (let i=1; i< text.length; i++)
    {
        let char = text.substring(i,1);
        if(char == '-') {
            text = text.substring(0,i) + text.substr(i+1);
            i--;
        }
    }
    text = text.replace(/^(-)?0+(?=\d)/,'$1')
    return text
}

const NameConstraint = (text) => {
    if (!text || typeof text !== 'string') {
        return ""
    }
    return text.substring(0, 50);
}

const ReduceFriendlyNumbers = (number, decPlaces) => {
    decPlaces = Math.pow(10,decPlaces);
    var abbrev = [ "K", "M", "B", "T", "Q" ];
    for (var i=abbrev.length-1; i>=0; i--) {
        var size = Math.pow(10,(i+1)*3);
        if(size <= number) {
            number = Math.round(number*decPlaces/size)/decPlaces;
            number += abbrev[i];
            break;
        }
    }
    return number;
}

export {
    NumberInputValidation,
    ReduceFriendlyNumbers,
    NameConstraint
}
