let mealState = []
let ruta = 'login' //login, register, orders
let user = {}
const toHTML = (s) =>
{
    const parser = new DOMParser()
    const doc = parser.parseFromString(s,'text/html')
    return doc.body.firstChild
}
const renderItem = (item) =>
{
    const elemento = toHTML(`<li data-id=${item._id}>${item.name}</li>`)

    elemento.addEventListener('click', () => 
    {
        const mealsList = document.getElementById("meals-list")
        Array.from(mealsList.children).forEach(x => x.classList.remove('selected'))
        elemento.classList.add('selected')
        const mealsIdInput = document.getElementById("meals-id")
        mealsIdInput.value = item._id
    })

    return elemento
}
const renderOrder = (order, meals) => 
{
    const meal = meals.find(meal => meal._id == order.meal_id)
    const elemento = toHTML(`<li data-id=${order._id}>${meal.name} - ${order.user_id}</li>`)
    return elemento
}
const initOrder = () =>  
{
    const ordenar = document.getElementById('order')
    ordenar.onsubmit = (evt) =>
    {
        evt.preventDefault()
        const submit = document.getElementById('submit')
        submit.setAttribute('disabled', true)
        const mealId = document.getElementById('meals-id')
        const mealIdValue= mealId.value
        if(!mealIdValue)
        {
            alert('Debes seleccionar un plato de comida.')
            submit.removeAttribute('disabled')
            return
        }
        const order = {
            meal_id: mealIdValue,
            user_id: user._id,
        }
        fetch('http://localhost:3000/api/orders/',
        {
            method : 'POST',
            headers : {'Content-Type':'application/json',
                        authorization: localStorage.getItem('token'),},
            body : JSON.stringify(order),
        }).then(x => x.json())
          .then(respuesta => 
            {
                const renderedOrder = renderOrder(respuesta, mealState)
                const ordersList = document.getElementById('orders-list')
                ordersList.appendChild(renderedOrder)
                submit.removeAttribute('disabled')
            })
    }

}
const initData = () =>
{
    fetch('http://localhost:3000/api/meals/')
    .then(response => response.json())
    .then(data => 
        {   mealState = data
            const mealsList = document.getElementById("meals-list")
            const submit = document.getElementById("submit")
            const itemList = data.map(renderItem)
            mealsList.removeChild(mealsList.firstElementChild)
            itemList.forEach(elemento => mealsList.appendChild(elemento))
            submit.removeAttribute('disabled')
            fetch('http://localhost:3000/api/orders/')
             .then(response => response.json())
             .then(ordersData =>
                {
                    const ordersList = document.getElementById('orders-list')
                    const listOrders = ordersData.map(orderData => renderOrder(orderData, data))
                    ordersList.removeChild(ordersList.firstElementChild)
                    listOrders.forEach(elemento => ordersList.appendChild(elemento))
                })
        })
}
const renderLogin = () =>
{
    const loginView = document.getElementById('login-view')
    document.getElementById('app').innerHTML = loginView.innerHTML

    const loginForm = document.getElementById('login-form')
    loginForm.onsubmit = (evt) =>
    {
        evt.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        fetch('http://localhost:3000/api/auth/login', 
        {   
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({email, password})
        }).then(x => x.json())
          .then(respuesta =>
            {
                localStorage.setItem('token', respuesta.token)
                ruta = 'orders'
                return respuesta.token
                //renderOrders()
            })
          .then(token => 
            {
                return fetch('http://localhost:3000/api/auth/me',
                {
                    method: 'GET',
                    headers:{'Content-Type': 'application/json',
                              authorization: token,},    
                })
            })
          .then(promise => promise.json())
          .then(fetchedUser => 
            {
                localStorage.setItem('user',JSON.stringify(fetchedUser))
                user = fetchedUser
                renderOrders()
            }) 
    }
}
const renderOrders = () => 
{
    const ordersView = document.getElementById('orders-view')
    document.getElementById('app').innerHTML = ordersView.innerHTML

    initOrder()
    initData()
}
const renderApp = () => 
{
    const token = localStorage.getItem('token')
    if(token)
    {
        user = JSON.parse(localStorage.getItem('user'))
        return renderOrders();
    }
    renderLogin()
}
window.onload = () =>
{
    renderApp()     
}