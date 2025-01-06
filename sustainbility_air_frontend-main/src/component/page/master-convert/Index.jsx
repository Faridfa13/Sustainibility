import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS } from 'chart.js/auto';

function PowerDataChart() {
    const [chartData, setChartData] = useState(null);
    const [viewMode, setViewMode] = useState('daily'); // Default to 'daily' view mode
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [availableYears, setAvailableYears] = useState([]); // Array to store available years
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5255/api/Import/powerdata-graph');
                const data = response.data;
    
                // Get unique years from the data
                const years = [...new Set(data.map(item => new Date(item.pwd_timeperiod).getFullYear()))];
                setAvailableYears(years); // Set available years to dropdown
                
                const times = [];
                const powers = [];
    
                data.forEach(item => {
                    const date = new Date(item.pwd_timeperiod);
                    const powerValue = item.pwd_power;
                
                    // Hanya ambil data untuk mode 'daily' berdasarkan jam dan menit
                    if (viewMode === 'daily') {
                        const hours = date.getHours();
                        const minutes = date.getMinutes();
                    
                        // Filter semua data yang waktu jamnya bukan 00:00:00
                        if (!(hours === 0 && minutes === 0)) {
                            times.push(`${hours}:${minutes < 10 ? '0' + minutes : minutes}`);
                            powers.push(powerValue);
                        }                                  
                    } else if (viewMode === 'date' && date.getFullYear() === selectedYear) {
                        if (selectedMonth === null || date.getMonth() === selectedMonth) {
                            // For monthly view, show full date (e.g., "Jan 2024")
                            const monthLabel = date.toLocaleString('default', { month: 'short' });
                            const yearLabel = date.getFullYear();
                            times.push(`${monthLabel} ${yearLabel}`);
                            powers.push(powerValue);
                        }
                    } else if (viewMode === 'year' && date.getFullYear() === selectedYear) {
                        // For yearly view, show just the year with month (e.g., "Jan 2024")
                        if (date.getDate() === 1) {
                            const monthLabel = date.toLocaleString('default', { month: 'short' });
                            times.push(`${monthLabel} ${date.getFullYear()}`);
                            powers.push(powerValue);
                        }
                    }
                });
    
                const colors = [];
                let currentColor = 'rgba(75,192,192,1)';
    
                powers.forEach((power, index) => {
                    if (index > 0 && Math.abs(power - powers[index - 1]) > 50) {
                        currentColor = 'rgba(255,99,132,1)';
                    }
                    colors.push(currentColor);
                });
    
                setChartData(
                    times.length && powers.length
                        ? {
                            labels: times,
                            datasets: [
                                {
                                    label: 'Power Data',
                                    data: powers,
                                    borderColor: colors,
                                    backgroundColor: 'rgba(75,192,192,0.4)',
                                    borderWidth: 1,
                                    segment: {
                                        borderColor: ctx => colors[ctx.p1DataIndex] || currentColor,
                                    },
                                },
                            ],
                        }
                        : null
                );
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
    
        fetchData();
    }, [viewMode, selectedMonth, selectedYear]);
    

    const months = [
        { value: 0, label: 'January' },
        { value: 1, label: 'February' },
        { value: 2, label: 'March' },
        { value: 3, label: 'April' },
        { value: 4, label: 'May' },
        { value: 5, label: 'June' },
        { value: 6, label: 'July' },
        { value: 7, label: 'August' },
        { value: 8, label: 'September' },
        { value: 9, label: 'October' },
        { value: 10, label: 'November' },
        { value: 11, label: 'December' },
    ];

    return (
        <div style={{ width: '1200px', margin: 'auto', marginTop: '30px' }}>
            <h2>Grafik Power Data</h2>
            {/* View Mode Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <button
                    onClick={() => setViewMode('daily')}
                    style={{
                        padding: '10px 20px',
                        marginRight: '10px',
                        backgroundColor: viewMode === 'daily' ? '#007bff' : '#e0e0e0',
                        color: viewMode === 'daily' ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Daily
                </button>
                <button
                    onClick={() => setViewMode('date')}
                    style={{
                        padding: '10px 20px',
                        marginRight: '10px',
                        backgroundColor: viewMode === 'date' ? '#007bff' : '#e0e0e0',
                        color: viewMode === 'date' ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Monthly
                </button>
                <button
                    onClick={() => setViewMode('year')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: viewMode === 'year' ? '#007bff' : '#e0e0e0',
                        color: viewMode === 'year' ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Yearly
                </button>
            </div>

            {/* Year Selection Dropdown */}
            {/* {viewMode !== 'daily' && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        style={{ padding: '10px', borderRadius: '5px' }}
                    >
                        {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 10 + i).map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
            )} */}

            {/* Dropdown Tahun - Hanya Satu Kali */}
            {viewMode !== 'daily' && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    {/* <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        style={{ padding: '10px', borderRadius: '5px' }}
                    >
                        {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 10 + i).map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select> */}
                </div>
            )}


            {/* Dropdown Bulan (Hanya untuk Mode Monthly) */}
            {viewMode === 'date' && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <select
                        value={selectedMonth !== null ? selectedMonth : ''}
                        onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : null)}
                        style={{ marginRight: '10px', padding: '10px', borderRadius: '5px' }}
                    >
                        <option value="">Select Month</option>
                        {months.map((month) => (
                            <option key={month.value} value={month.value}>
                                {month.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}



            {/* Year Selection Dropdown */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    style={{ padding: '10px', borderRadius: '5px' }}
                >
                    {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 10 + i).map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
            </div>

            {/* Display Chart */}
            {chartData ? (
                <div style={{ height: '395px' }}>
                    <Line data={chartData} options={{ maintainAspectRatio: false }} />
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}

export default PowerDataChart;
