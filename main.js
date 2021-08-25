let mealState = []
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
window.onload = () =>
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
            return
        }
        const order = {
            meal_id: mealIdValue,
            user_id: 'Mi',
        }
        console.log(order)
        fetch('http://localhost:3000/api/orders/',
        {
            method : 'POST',
            headers : {'Content-Type':'application/json'},
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