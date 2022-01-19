const socket= io()

//Elements
const $msgForm= document.querySelector('#msgform')
const $msgFormInput= $msgForm.querySelector('input') 
const $msgFormButton= $msgForm.querySelector('button') 

const $locationButton= document.querySelector("#send-location")
const $messages= document.querySelector('#messages')
const $sidebar= document.querySelector('#sidebar')

//Templates
const messageTemplate= document.querySelector('#message-template').innerHTML
const locationMessageTemplate= document.querySelector('#locationMessage-template').innerHTML
const sidebarTemplate= document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room}= Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoscroll= ()=>{
    //New Message element
    const $newMessage= $messages.lastElementChild

    //Height of the new message
    const newMessageStyles= getComputedStyle($newMessage)
    const newMessageMargin= parseInt(newMessageStyles.marginBottom)
    const newMessageHeight= $newMessage.offsetHeight + newMessageMargin

    //Visible Height
    const visibleHeight= $messages.offsetHeight

    //Height of Messages container
    const containerHeight= $messages.scrollHeight

    //How far we have scrolled
    const scrollOffset= $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop= $messages.scrollHeight
    }
}

socket.on('message', (msg)=> {
    console.log(msg)
    const html= Mustache.render(messageTemplate, {
        username: msg.username,
        msg: msg.text,
        createdAt: moment(msg.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (url)=> {
    console.log(url)
    const html= Mustache.render(locationMessageTemplate, {
        username: url.username,
        url: url.url,
        createdAt: moment(url.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room , users})=> {
    const html= Mustache.render(sidebarTemplate, {
        room,
        users
    })
    $sidebar.innerHTML= html
})

$msgForm.addEventListener('submit', (e)=>{
    e.preventDefault()

    $msgFormButton.setAttribute('disabled', 'disabled') //disable
    
    const msg= e.target.elements.message.value

    socket.emit('print', msg, (error)=> {
        $msgFormButton.removeAttribute('disabled')
        $msgFormInput.value= ''
        $msgFormInput.focus()
        // enable
        if(error)
            return console.log(error)
        
        console.log('Delivered!')
    })
})

$locationButton.addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.')
    }

    $locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position)=> {       
        socket.emit('sendlocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        }, ()=>{
            $locationButton.removeAttribute('disabled')
            console.log('Location Shared!')
        })
    })
})

socket.emit('join', {username, room}, (error)=> {
    if(error){
        alert(error)
        location.href= '/'
    }
})

// socket.on('countUpdated', (count)=> {
//     console.log('The count has been updated ', count)
// })

// socket.on('welcome', ()=> {
//     console.log('Welcome new user!!!')
// })

// document.querySelector('#increment').addEventListener('click', ()=>{
//     // console.log('Clicked')   
//     socket.emit('increment') 
// })

// document.querySelector('#msg').addEventListener('click', ()=>{
//     // console.log('Clicked')   
//     socket.emit('print') 
// })