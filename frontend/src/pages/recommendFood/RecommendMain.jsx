/*global kakao*/
import React, {useEffect, useState} from 'react';
import '../../assets/style/RecommendMain.css';
import '../../assets/style/allSearch/AllSearch.css';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMagnifyingGlass} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

function RecommendMain() {
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState('');
    const [topKeywords, setTopKeywords] = useState([]);

    const dummyRecommendations = [
        {id: 1, name: '브레댄코 강남점', address: '서울특별시 강남구 역삼동 825-19', distance: '500', reviews: '125'},
        {id: 2, name: '담미온', address: '서울특별시 강남구 역삼동 823', distance: '800', reviews: '256'},
        {id: 3, name: '이삭토스트', address: '서울특별시 강남구 역삼동 817-11', distance: '1.2km', reviews: '88'},
    ];

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        navigate(`/recommend/recommendFoodCategory?category=${category}`);
    };

    const handleSearch = async () => {
        try {
            await axios.post('http://localhost:8080/api/PopularSearch', keyword, {
                headers: {
                    'Content-Type': 'text/plain',
                },
                withCredentials: true,
            });
            alert('검색어가 저장되었습니다.');
            fetchTopKeywords(); // 새로운 검색어 저장 후 인기 검색어를 다시 가져옵니다.
        } catch (error) {
            console.error('오류가 발생했습니다!', error);
        }
    };

    const fetchTopKeywords = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/TopKeywords', {
                withCredentials: true,
            });
            setTopKeywords(response.data);
        } catch (error) {
            console.error('인기 검색어를 가져오는 중 오류가 발생했습니다!', error);
        }
    };

    useEffect(() => {
        fetchTopKeywords();
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className={"RecommendMain"}>
            <div className="SearchInput">
                <input
                    className="AllSaerchBox"
                    type="text"
                    placeholder="검색 키워드를 입력해주세요"
                />
                <button className="AllSearchButton">
                    <FontAwesomeIcon icon={faMagnifyingGlass}/>
                </button>
            </div>

            <div className={"real-time-popularity"}>
                <p>실시간 인기</p>
                <ul style={{listStyleType: 'none', padding: 0}}>
                    {topKeywords.map((keyword, index) => (
                        <li key={index}>{index + 1}. {keyword.keyword}</li>
                    ))}
                </ul>
            </div>

            <div className="recommend-container">

                {/* 메뉴 추천 */}
                <div className="menu-recommendation">
                    <p>이건 어떠신가요?</p>
                    <button className="recommend-button">마라탕</button>
                </div>

                {/* 월드컵 */}
                <div className="menu-worldcup">
                    <p>메뉴 정하기 힘들 때</p>
                    <button className="worldcup">월드컵</button>
                </div>

                {/* 추천 카테고리 */}
                <div className="recommended-categories">
                    추천 카테고리
                    <div className="category-icons">
                        {/* 아이콘 제거 */}
                    </div>
                    <div className="category-description">
                        <button>칼칼</button>
                        <button>부장님은 느끼한 게 싫다고 하셨어</button>
                    </div>
                </div>


                {/* 카테고리 */}
                <div className="recommend-title">카테고리별 맛집 추천</div>
                <div>
                    {['전체', '한식', '중식', '일식', '양식', '패스트푸드', '분식','치킨','피자','아시아음식', '뷔페', '도시락'].map((category) => (
                        <button
                            key={category}
                            className={`recommend-category-button ${selectedCategory === category ? 'active' : ''}`}
                            onClick={() => handleCategoryClick(category)} // Link 대신 onClick 사용
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* 회식장소 Pick */}
                <div className="group-dinner-pick">
                    회식장소 Pick
                    <div className="text-buttons">
                        <button>고기</button>
                        <button>노래타운</button>
                        <button>회</button>
                        <button>호프</button>
                        <button>이자카야</button>
                    </div>
                    <ul className="restaurant-info-list">
                        {dummyRecommendations.map((restaurant) => (
                            <li key={restaurant.id} className="restaurant-info-item">
                                <div className="restaurant-name">{restaurant.name}</div>
                                <div className="restaurant-distance">{restaurant.distance}m</div>
                                <div className="restaurant-reviews">{restaurant.reviews} 리뷰</div>

                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default RecommendMain;
