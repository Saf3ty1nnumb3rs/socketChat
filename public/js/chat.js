



const socket = io()

var messageCounter = 0;
var favicon=new Favico({
    animation:'popFade'
});

///////////////////////// Client Connect
socket.on('connect', () => {
    new EmojiPicker().discover()
    console.log('Connected to server.')
    const params = getQuery(window.location.search)
    socket.emit('join', params, (err) => {
        if(err) {
            alert(err);
            window.location.href = '/';
        } else {
            document.title = `${capsFirstLetter(params.room)} | ChatApp`;
            console.log('No error')
        }
    })
})
/////////////////////// Client Disconnect
socket.on('disconnect', () => {
    console.log('Disconnected from server')

})

socket.on('updateUserList', (users) => {
    console.log('Users list', users)
    const ol = document.createElement('ol')
    users.forEach((user) => {
        const line = document.createElement('li')
        if(line.textContent !== user) {
           ol.appendChild(line)
           let userName = document.createTextNode(user)
           line.appendChild(userName)
       }
    
    })
    document.getElementById('users').innerHTML = ''
    document.getElementById('users').appendChild(ol)
})
//////////////////////////New message call
socket.on('newMessage', (message) => {
    const formattedTime = moment(message.createdAt).format('h:mm a');
    const template = document.getElementById('message-template').innerHTML;
    const html = Mustache.render(template, {
        text: message.text,
        from: message.from,
        createdAt: formattedTime
    });

    document.getElementById('messages').innerHTML += html
    scrollToBottom();
    messageCountInTab();
})
//////////////////////////////Send Location
socket.on('newLocationMessage', (message) => {
    const formattedTime = moment(message.createdAt).format('h:mm a');
    const template = document.getElementById('location-message-template').innerHTML;
    const html = Mustache.render(template, {
        from: message.from,
        url: message.url,
        createdAt: formattedTime
    })
    document.getElementById('messages').innerHTML += html
    
    scrollToBottom();
    messageCountInTab();
})

///////////////////////////Form Submit Listener
    const messageTextbox = document.getElementById('message-form');
    messageTextbox.addEventListener('submit', (e) => {
        e.preventDefault()
        socket.emit('createMessage', {
            text: document.getElementsByName('message')[0].value
        }, () => {
            // messageTextbox.reset()
            document.getElementsByClassName('emoji-wysiwyg-editor')[0].innerHTML = '';

        })
    })

////////////////////////////// On-click Listener
const locationButton = document.getElementById('send-location');
locationButton.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolocation not supported by your browser.')
    }
    //disable button until process completes
    locationButton.setAttribute('disabled', 'true');
    locationButton.innerText = 'Sending...';
    navigator.geolocation.getCurrentPosition( (position) => {
        //re-enable button once complete
        locationButton.removeAttribute('disabled');
        locationButton.innerText = 'Send Location'
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        })
        console.log(position)
    }, () => {
        locationButton.removeAttribute('disabled');
        locationButton.innerText = 'Send Location'
        alert('Unable to fetch location');
    })
})

window.onload = () => {

    window.onfocus = () => {
        if(messageCounter> 0) {
            clearTabCount();
        }
    }

}

