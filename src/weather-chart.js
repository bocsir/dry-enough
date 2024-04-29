let percipProbHourly = [];
const clickedDay = localStorage.getItem('clickedDay');

const apiData = JSON.parse(localStorage.getItem('apiData'));

//get percip data for every other hour in the day
for (let i = 0; i < 24; i+=2) {
    const hourOfDay = i + (clickedDay*24);
    percipProbHourly.push(apiData.hourly.precipitation_probability[hourOfDay]);
}
console.log(percipProbHourly);
const ctx = document.getElementById('myChart').getContext('2d');

let gradient = ctx.createLinearGradient(0, 0, 0, 400);
gradient.addColorStop(1, 'rgba(89, 89, 255, 0.8)');

gradient.addColorStop(0, 'rgba(0, 0, 161, 0.3)');

const labels = ['12 AM', '2 AM', '4 AM', '6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'];

const data = {
    labels: labels,
    datasets: [{
        label: 'Precipitation Chance',
        data: percipProbHourly,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, .6)',
        pointBackgroundColor: 'rgba(255, 255, 255, .6)',
        hoverRadius: 12,
        hitRadius: 30,
        fill: true,
        backgroundColor: gradient,
        tension: 0.3,
    }]
}

let delayed;

const config = {
    type: 'line',
    data: data, 
    options: {
        scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value){
                  return value + '%';
                }
              }
            }   
        },
        responsive: true,
        animation: {
            onComplete: () => {
                delayed = true
            },
            delay: (context) => {
                let delay = 0
                if(context.type === 'data' && context.mode === 'default' && !delayed) {
                    delay = context.dataIndex * 300 + context.datasetIndex * 100
                }
                return delay
            }
        }
    }
}

const myChart = new Chart(ctx, config);