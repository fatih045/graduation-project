import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

import "../styles/list.css"
// Define our shipping offer interface
export interface ShippingOffer {
    id: number;
    company: string;
    logo: string;
    cargoType: string;
    capacity: string;
    origin: string;
    destination: string;
    startDate: string;
    endDate: string;
    price: number;
}

// API Service
const apiService = {
    // Simulated API call
    getShippingOffers: async (): Promise<ShippingOffer[]> => {
        // Normally this would be a fetch call to your API
        // For now we'll return mock data with a simulated delay
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockData);
            }, 500);
        });
    }
};

const ShippingMarketplace: React.FC = () => {
    const [offers, setOffers] = useState<ShippingOffer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Fetch data on component mount
    useEffect(() => {
        const fetchOffers = async () => {
            try {
                setLoading(true);
                const data = await apiService.getShippingOffers();
                setOffers(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching shipping offers:', err);
                setError('Veri yüklenirken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, []);

    // Filter offers based on search term
    const filteredOffers = offers.filter(offer =>
        offer.cargoType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Logo component based on company name
    const CompanyLogo = ({ company }: { company: string }) => {
        switch (company) {
            case 'ARKAS':
                return <div className="list-company-logo list-arkas">A</div>;
            case 'Microsoft':
                return <div className="list-company-logo list-microsoft"></div>;
            case 'BMW':
                return <div className="list-company-logo list-bmw">B</div>;
            case 'Apple':
                return <div className="list-company-logo list-apple"></div>;
            case 'TAB':
                return <div className="list-company-logo list-tab">TAB</div>;
            default:
                return <div className="list-company-logo list-default"></div>;
        }
    };

    return (
        <div className="list-shipping-container">
            {/* Main Content */}
            <div className="list-main-content">
                {/* Search bar - Can be moved elsewhere or removed if it's in your header */}
                <div className="list-search-container">
                    <div className="list-search-icon">
                        <Search className="list-search-icon-svg" />
                    </div>
                    <input
                        type="text"
                        className="list-search-input"
                        placeholder="Ne arıyorsun"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Recommendations Section */}
                <div className="list-recommendations">
                    <div className="list-section-header">
                        <h2 className="list-section-title">Sana Öneriler</h2>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="list-dropdown-icon"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>

                    {/* Loading and Error States */}
                    {loading && <div className="list-loading-state">Yükleniyor...</div>}
                    {error && <div className="list-error-state">{error}</div>}

                    {/* Shipping Offers */}
                    <div className="list-offers-container">
                        {filteredOffers.map((offer) => (
                            <div key={offer.id} className="list-offer-card">
                                <div className="list-offer-details">
                                    <CompanyLogo company={offer.company} />
                                    <div className="list-offer-info">
                                        <div className="list-cargo-details">
                                            <span className="list-label">Yük Türü: </span>
                                            <span className="list-value">{offer.cargoType}</span>
                                            <span className="list-label list-capacity">Kapasite: </span>
                                            <span className="list-value">{offer.capacity}</span>
                                        </div>
                                        <div className="list-route-details">
                                            <span className="list-label">Nereden: </span>
                                            <span className="list-value">{offer.origin}</span>
                                            <span className="list-label list-destination">Nereye: </span>
                                            <span className="list-value">{offer.destination}</span>
                                        </div>
                                        <div className="list-date-details">
                                            <span className="list-label">Tarih: </span>
                                            <span className="list-value">{offer.startDate} - {offer.endDate}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="list-price-container">
                                    <div className="list-offer-label">Teklif</div>
                                    <div className="list-price">{offer.price.toLocaleString()}₺</div>
                                </div>
                            </div>
                        ))}

                        {filteredOffers.length === 0 && !loading && (
                            <div className="list-no-results">Sonuç bulunamadı.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Mock data for development
const mockData: ShippingOffer[] = [
    {
        id: 1,
        company: 'ARKAS',
        logo: '/api/placeholder/40/40',
        cargoType: 'Kuru Gıda',
        capacity: '3 Ton',
        origin: 'İzmir',
        destination: 'İstanbul',
        startDate: '03.09.2024',
        endDate: '05.09.2024',
        price: 12500
    },
    {
        id: 2,
        company: 'Microsoft',
        logo: '/api/placeholder/40/40',
        cargoType: 'Teknoloji',
        capacity: '3 Ton',
        origin: 'İstanbul',
        destination: 'Muğla',
        startDate: '07.09.2024',
        endDate: '10.09.2024',
        price: 38500
    },
    {
        id: 3,
        company: 'BMW',
        logo: '/api/placeholder/40/40',
        cargoType: 'Otomotiv',
        capacity: '12 Ton',
        origin: 'İstanbul',
        destination: 'Antalya',
        startDate: '03.09.2024',
        endDate: '05.09.2024',
        price: 65000
    },
    {
        id: 4,
        company: 'ARKAS',
        logo: '/api/placeholder/40/40',
        cargoType: 'Kuru Gıda',
        capacity: '3 Ton',
        origin: 'İzmir',
        destination: 'İstanbul',
        startDate: '03.09.2024',
        endDate: '05.09.2024',
        price: 12500
    },
    {
        id: 5,
        company: 'Apple',
        logo: '/api/placeholder/40/40',
        cargoType: 'Apple',
        capacity: '32 Ton',
        origin: 'İstanbul',
        destination: 'İstanbul',
        startDate: '03.09.2024',
        endDate: '05.09.2024',
        price: 78500
    },
    {
        id: 6,
        company: 'TAB',
        logo: '/api/placeholder/40/40',
        cargoType: 'Kuru Gıda',
        capacity: '23 Ton',
        origin: 'İstanbul',
        destination: 'İstanbul',
        startDate: '03.09.2024',
        endDate: '05.09.2024',
        price: 89500
    },
    {
        id: 7,
        company: 'ARKAS',
        logo: '/api/placeholder/40/40',
        cargoType: 'Kuru Gıda',
        capacity: '3 Ton',
        origin: 'İzmir',
        destination: 'İstanbul',
        startDate: '03.09.2024',
        endDate: '05.09.2024',
        price: 12500
    }

];

export default ShippingMarketplace;