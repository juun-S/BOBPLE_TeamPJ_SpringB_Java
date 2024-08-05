/*global kakao*/
import React, { useEffect, useState, useRef, useCallback } from 'react';
import '../../assets/style/recommendFood/RecommendMain.css';
import '../../assets/style/allSearch/AllSearch.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import {
    Bookmark,
    FillBookmark,
    LocationDot,
    MainFoodBanner,
    SearchIcon,
    Trophy
} from "../../components/imgcomponents/ImgComponents";
import {FoodCategories, RecommendedCategories, TeamDinnerPick, TopSearch} from "../../components/SliderComponent";
import { restaurantfetchTopKeywords } from '../../components/Search/RestaurantSearch';
import {getUserIdx} from "../../utils/auth";

function RecommendMain() {
    const [topKeywords, setTopKeywords] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const navigate = useNavigate();
    const [nearbyPub, setNearbyPub] = useState([]);
    const [allNearbyPub, setAllNearbyPub] = useState([]);
    const [keyword, setKeyword] = useState("");

    const [recommendedFood, setRecommendedFood] = useState(null);
    const [recommendThemes, setRecommendThemes] = useState([]);

    const [page, setPage] = useState(1);
    const observer = useRef();
    const categories = ['전체', '고기', '회', '호프', '이자카야'];

    const [userBookmarks, setUserBookmarks] = useState([]);

    // nearbyPub 상태를 거리순으로 정렬
    const sortedNearbyPub = [...nearbyPub].sort((a, b) => a.distance - b.distance);

    useEffect(() => {
        const fetchUserBookmarks = async () => {
            const userIdx = getUserIdx();
            if (userIdx) {
                try {
                    const response = await axios.get(`http://localhost:8080/api/bookmarks/restaurants/${userIdx}`);

                    // response.data가 undefined 또는 null인 경우 빈 배열로 설정
                    const bookmarksData = response.data || [];
                    setUserBookmarks(bookmarksData.map(bookmark => bookmark.restaurantId));
                } catch (error) {
                    console.error('북마크 정보 가져오기 실패:', error);
                    // 추가적인 에러 처리 로직 (예: 사용자에게 에러 메시지 표시)
                }
            }
        };

        fetchUserBookmarks();
    }, []);


    const handleBookmarkToggle = async (pubId) => {
        const userIdx = getUserIdx();
        if (userIdx) { // 로그인한 경우에만 북마크 정보 가져오기
            try {
                const isBookmarked = userBookmarks.includes(pubId);
                if (isBookmarked) {
                    const deleteResponse = axios.delete(`http://localhost:8080/api/bookmarks/restaurants/${pubId}`, {
                        data: { userIdx }
                    });

                    setUserBookmarks(prevBookmarks => prevBookmarks.filter(id => id !== pubId));
                    // 북마크 개수 업데이트 (필요에 따라)
                    setNearbyPub(prevPubs => prevPubs.map(pub =>
                        pub.id === pubId ? { ...pub, bookmarks_count: (pub.bookmarks_count || 0) - 1 } : pub
                    ));
                } else {
                    // 북마크 추가 요청
                    const addResponse = axios.post('http://localhost:8080/api/bookmarks/restaurants', {userIdx, restaurantId: pubId});
                    setUserBookmarks(prevBookmarks => [...prevBookmarks, pubId]);

                    // 북마크 개수 업데이트 (필요에 따라)
                    setNearbyPub(prevPubs => prevPubs.map(pub =>
                        pub.id === pubId ? { ...pub, bookmarks_count: (pub.bookmarks_count || 0) + 1 } : pub
                    ));
                }
            } catch (error) {
                console.error('북마크 처리 실패:', error);
            }
        }
    }

    useEffect(() => {
        restaurantfetchTopKeywords(setTopKeywords);
    }, []);

    const moveFoodWorldCup = () => {
        navigate('/recommend/foodWorldCup/foodWorldCup');
    }

    // New function to load more pubs on scroll
    const loadMorePubs = useCallback(() => {
        const loadedPubIds = new Set(nearbyPub.map(pub => pub.id)); // 이미 로드된 술집 id 저장
        const nextPagePubs = allNearbyPub.slice(page * 5, (page + 1) * 5)
            .filter(pub => !loadedPubIds.has(pub.id)); // 이미 로드된 술집 제외

        if (nextPagePubs.length > 0) {
            setNearbyPub(prevPubs => [...prevPubs, ...nextPagePubs]);
            setPage(prevPage => prevPage + 1);
        }
    }, [allNearbyPub, page, nearbyPub]); // nearbyPub 추가

    // Infinite scroll observer
    const lastPubElementRef = useCallback(node => {
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                loadMorePubs();
            }
        });
        if (node) observer.current.observe(node);
    }, [loadMorePubs]);


    const handleRecommendedFoodClick = () => {
        if (recommendedFood) {
            navigate(`/recommend/recommendFoodCategory?keyword=${recommendedFood.foodName}`);
        }
    };


    const handleGroupDinnerPickClick = (category) => {
        setSelectedCategory(category);
    };

    const handleSearch = () => {
        const trimmedKeyword = keyword.trim();
        if (!trimmedKeyword) {
            alert('키워드를 입력해주세요!');
            return;
        }
        try {
            axios.post('http://localhost:8080/api/search/saveKeyword', trimmedKeyword, {
                headers: {
                    'Content-Type': 'text/plain',
                },
                withCredentials: true, // 필요에 따라 쿠키 등을 전송할 수 있도록 설정
            });
            console.log('검색어가 저장되었습니다.');
            restaurantfetchTopKeywords(setTopKeywords); // 검색어 저장 후 인기 검색어 업데이트
        } catch (error) {
            console.error('검색어 저장 실패:', error);
        }

        // 검색 키워드를 쿼리 파라미터로 추가하여 RecommendFoodCategory 페이지로 이동
        navigate(`/recommend/recommendFoodCategory?keyword=${trimmedKeyword}`); // 검색어 정보 전달
    };

    useEffect(() => {
        const ps = new kakao.maps.services.Places();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    searchPubsByCategory(latitude, longitude, selectedCategory);
                },
                (err) => {
                    console.error("geolocation을 사용할 수 없어요:", err.message);
                }
            );
        } else {
            console.error("geolocation을 사용할 수 없어요.");
        }

        function searchPubsByCategory(latitude, longitude, category) {
            const searchOptions = {
                location: new kakao.maps.LatLng(latitude, longitude),
                radius: 2000,
                size: 15, // Load more pubs initially
            };

            // 검색 키워드 설정 (전체 또는 선택된 카테고리, 이자카야는 일본식주점으로 검색)
            const searchKeyword = category === '전체' ? '술집' :
                category === '이자카야' ? '일본식주점' : category;

            ps.keywordSearch(searchKeyword, (data, status) => {
                if (status === kakao.maps.services.Status.OK) {
                    let filteredData = data;
                    if (category !== '전체') {
                        // '전체'가 아닌 경우, 카테고리 이름 또는 '일본식주점'을 포함하는 술집만 필터링
                        filteredData = data.filter(pub =>
                            pub.category_name.includes(category) ||
                            (category === '이자카야' && pub.category_name.includes('일본식주점'))
                        );
                    }

                    // 각 술집의 북마크 개수를 가져오는 요청
                    const fetchBookmarkCounts = async (pubIds) => {
                        try {
                            const response = await axios.get('http://localhost:8080/api/bookmarks/restaurants/count', {
                                params: { restaurantIds: pubIds.join(',') }
                            });
                            return response.data;
                        } catch (error) {
                            console.error('북마크 개수 가져오기 실패:', error);
                            return {};
                        }
                    }

                    fetchBookmarkCounts(filteredData.map(pub => pub.id)) // 술집 ID 배열 전달
                        .then(bookmarkCounts => {
                            // 사용자 북마크 정보와 북마크 개수를 이용하여 isBookmarked, bookmarks_count 필드 추가
                            const updatedData = filteredData.map(pub => ({
                                ...pub,
                                isBookmarked: userBookmarks.includes(pub.id),
                                bookmarks_count: bookmarkCounts[pub.id] || 0 // 북마크 개수 설정
                            }));

                            setAllNearbyPub(updatedData);
                            setNearbyPub(updatedData.slice(0, 15));
                        });
                } else {
                    console.error("술집 검색 실패:", status);
                }
            }, searchOptions);
        }
    }, [selectedCategory, userBookmarks]);

    const dummyImage = "https://t1.daumcdn.net/thumb/C84x76/?fname=http://t1.daumcdn.net/cfile/2170353A51B82DE005";

    useEffect(() => {
        // 서버에서 추천 음식 정보 가져오기
        axios.get('http://localhost:8080/api/recommendFood')
            .then(response => {
                setRecommendedFood(response.data); // axios는 자동으로 JSON 변환
            })
            .catch(error => {
                console.error('추천 음식 정보 가져오기 실패:', error);
            });
    }, []);

    useEffect(() => {
        // 서버에서 추천 테마 정보 가져오기
        axios.get('http://localhost:8080/api/recommendThemes')
            .then(response => {
                setRecommendThemes(response.data);
            })
            .catch(error => {
                console.error('추천 테마 정보 가져오기 실패:', error);
            });
    }, []);

    const handleThemeClick = (themeIdx) => {
        // 바로 RecommendFoodCategory 페이지로 이동, 필요한 정보는 이미 recommendThemes에 있음
        const selectedTheme = recommendThemes.find(theme => theme.themeIdx === themeIdx);
        if (selectedTheme) {
            const themeKeyword = selectedTheme.foodNames.join(' ');
            navigate(`/recommend/recommendFoodCategory?theme=${themeKeyword}&themeName=${selectedTheme.themeName}`);
        }
    };

    return (
        <div className={"recommend-main"}>
            <div className={"recommend-search"}>
                <h3>메뉴가 고민되시나요?</h3>
                <div className="SearchInput">
                    <input
                        className="AllSaerchBox"
                        type="text"
                        placeholder="검색 키워드를 입력해주세요"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch();
                            }
                        }}
                    />
                    <button className="AllSearchButton" onClick={handleSearch} aria-label={"검색"}>
                        <SearchIcon/>
                    </button>
                    <TopSearch/>
                </div>
            </div>

            {/* 메뉴 추천 */}
            <div className="menu-recommendation">
                <h4>이건 어떠신가요?</h4>
                {recommendedFood && ( // 추천 음식 정보가 있을 때만 표시
                    <>
                        <div className={"menu-recommendation-back"}></div>
                        <button className="recommend-button" onClick={handleRecommendedFoodClick}>
                            <div className={"menu-recommendation-img"}>
                                <img src={recommendedFood.foodImageUrl} alt={recommendedFood.foodName}/>
                            </div>
                            <p className={"menu-recommendation-title"}>
                                {recommendedFood.foodName}
                            </p>
                        </button>
                    </>
                )}
            </div>

            {/* 월드컵 */}
            <div className="menu-worldcup">
                <h5>메뉴 정하기 힘들 때</h5>
                <button className="worldcup" onClick={moveFoodWorldCup}>
                    <h4>음식 월드컵</h4>
                    <Trophy/>
                </button>
            </div>

            {/* 추천 카테고리 */}
            <div className="recommended-categories">
                <h5>추천 카테고리</h5>
                <div className="category-description">
                    {recommendThemes.map(theme => (
                        <button key={theme.themeIdx} onClick={() => handleThemeClick(theme.themeIdx)}>
                            {theme.themeDescription}
                        </button>
                    ))}
                </div>
            </div>

            <div className={"food-categories"}>
                <h4>카테고리별 맛집 추천</h4>
                <FoodCategories/>
            </div>

            <div className="group-dinner-pick">
                <h4>회식장소 Pick</h4>
                <div className="restaurant-category-btn-container">
                    <div className="restaurant-category-buttons">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => handleGroupDinnerPickClick(category)}
                                className={selectedCategory === category ? 'active' : ''}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="restaurant-category-container">
                    {nearbyPub.length > 0 ? ( // nearbyPub 사용
                        <ul className="restaurant-info-list">
                            {sortedNearbyPub.map((pub, index) => (
                                <li
                                    key={pub.id}
                                    className="restaurant-info-item"
                                    ref={nearbyPub.length === index + 1 ? lastPubElementRef : null}
                                >
                                    <a className={"restaurant-image-link"} href={pub.place_url} target="_blank"
                                       rel="noreferrer">
                                        <img src={dummyImage} alt={pub.place_name} className="pub-image"/>
                                    </a>
                                    <div className="pub-info-container">
                                        <a href={pub.place_url} target="_blank" rel="noreferrer">
                                            <h6 className="pub-name">{pub.place_name}</h6>
                                        </a>
                                        <span
                                            className="pub-distance"><LocationDot/>{Math.round(pub.distance)}m</span>
                                        <button
                                            className="pub-bookmarks"
                                            onClick={() => handleBookmarkToggle(pub.id)} // 클릭 이벤트 추가
                                        >
                                            {userBookmarks.includes(pub.id) ? ( // 사용자 북마크에 포함된 경우
                                                <FillBookmark/>
                                            ) : (
                                                <Bookmark/>
                                            )}
                                            북마크 {pub.bookmarks_count || 0}
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>주변 술집이 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RecommendMain;
