import './MapLegends.css'

export function MapLegends () {
    return (
            <section className='legends-info'>
                <div className='legends-info-item'>
                    <svg  xmlns="http://www.w3.org/2000/svg" className='img-info-item' id='fg-item' viewBox="0 0 1 1" width='1rem' height='1rem'></svg>
                    <span>Flight Geography</span>
                </div>
                <div className='legends-info-item'>
                    <svg  xmlns="http://www.w3.org/2000/svg" className='img-info-item' id='cv-item' viewBox="0 0 1 1" width='1rem' height='1rem'></svg>
                    <span>Contingency Volume</span>
                </div>
                <div className='legends-info-item'>
                    <svg  xmlns="http://www.w3.org/2000/svg" className='img-info-item' id='grb-item' viewBox="0 0 1 1" width='1rem' height='1rem'></svg>
                    <span>Ground Risk Buffer</span>
                </div>
                <div className='legends-info-item'>
                    <img className='img-info-item' id='dl-item' alt='DL' src='/public/drone-marker.png' />
                    <span>Drone location</span>
                </div>
                <div className='legends-info-item'>
                    <svg  xmlns="http://www.w3.org/2000/svg" className='img-info-item' id='gl-item' viewBox="0 0 16 16" width='1rem' height='1rem'>
                        <circle cx="8" cy="8" r="7.5" fill="none" stroke="chocolate" strokeWidth="2"/>
                    </svg>
                    <span>Ground location</span>
                </div>
                <div className='legends-info-item'>
                    <svg  xmlns="http://www.w3.org/2000/svg" className='img-info-item' id='dr-item' viewBox="0 0 1 1" width='1rem' height='0.15rem'></svg>
                    <span>Node route</span>
                </div>
                <div className='legends-info-item'>
                    <svg  xmlns="http://www.w3.org/2000/svg" className='img-info-item' id='dgyaw-item' viewBox="0 0 1 1" width='1rem' height='0.15rem'></svg>
                    <span>Drone gimbal yaw direction</span>
                </div>
                <div className='legends-info-item'>
                    <svg  xmlns="http://www.w3.org/2000/svg" className='img-info-item' id='dhead-item' viewBox="0 0 1 1" width='1rem' height='0.25rem'></svg>
                    <span>Drone heading</span>
                </div>
        </section>
    )
}