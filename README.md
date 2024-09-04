# 밥플(Bobple) 본인기여 부분 한정

**AI와 함께하는 맛있는 레시피 탐험**

밥플은 AI 기술을 활용하여 사용자에게 개인 맞춤형 레시피를 추천하고, 다양한 검색 및 필터링 기능을 통해 원하는 레시피를 쉽고 빠르게 찾을 수 있도록 돕는 레시피 플랫폼 서비스입니다. 또한, 사용자들은 밥플에서 자신만의 레시피를 공유하고, 댓글 기능을 통해 다른 사용자들과 활발하게 소통하며 요리에 대한 즐거움을 함께 나눌 수 있습니다. 

## 핵심 기능

* **레시피 검색 & 필터링**: 키워드, 카테고리, 정렬 기준으로 원하는 레시피를 빠르게 찾아보세요. 🔍
* **AI 레시피 추천**: 냉장고 파먹기, 특별한 날, 혹은 그저 떠오르는 생각만으로도 딱 맞는 레시피를 AI가 추천해드립니다. 🤖
* **유저 맞춤 레시피 추천**: 당신의 취향을 저격하는 맞춤 레시피를 만나보세요. ❤️
* **최신 레시피**: 끊임없이 업데이트되는 새로운 레시피들을 무한 스크롤로 즐겨보세요. ⏰
* **나만의 레시피 공유**: 자신만의 특별한 레시피를 등록하고, 다른 사용자들과 댓글로 소통하며 요리의 즐거움을 나누세요. 💬
* **편리한 사용성**: 반응형 디자인으로 PC, 태블릿, 모바일 어디서든 편리하게 밥플을 이용할 수 있습니다. 📱

## 기술 스택

* **프론트엔드**: React, React Router, Axios, Context API, LocalStorage
* **백엔드**: Spring Boot, JPA, RESTful API, AWS S3, Naver HyperCLOVA X
* **외부 서비스**: AWS S3 (이미지 저장), Naver HyperCLOVA X (AI 레시피 추천)

## 프로젝트 구조

```
밥플
├── frontend
│   ├── components
│   │   ├── ... (공통 컴포넌트)
│   │   └── recipe
│   │       ├── AIRecommendation.jsx
│   │       ├── LatestRecipeCard.jsx
│   │       ├── MyLikeRecipe.jsx
│   │       ├── MyRecipe.jsx
│   │       ├── RecipeCard.jsx
│   │       ├── RecipeDetail.jsx
│   │       ├── RecipeForm.jsx
│   │       ├── RecipeMain.jsx
│   │       ├── RecipeModify.jsx 
│   │       └── RecipeSearchResults.jsx
│   ├── pages
│   │   └── recipe
│   │       └── RecipeContext.jsx
│   ├── router
│   │   └── RecipeRouter.jsx
│   └── utils
│       ├── axios.js
│       └── localStorageUtils.js
└── backend
    ├── controller
    │   ├── ...
    │   ├── LikeRecipeController.java
    │   ├── RecipeCommentController.java
    │   └── RecipeController.java 등 레시피 관련 컨트롤러
    ├── dto
    │   ├── ...
    │   └── RecipeDto.java 등 레시피 관련 DTO
    ├── entity
    │   ├── ...
    │   └── Recipe.java 등 레시피 관련 엔티티
    ├── repository
    │   ├── ...
    │   └── RecipeRepository.java 등 레시피 관련 레포지토리
    └── service
        ├── ...
        ├── HyperCLOVAClient.java
        └── RecipeService.java 등 레시피 관련 서비스
```

## 핵심 기술 설명

* **AI 기반 개인 맞춤형 레시피 추천**: 사용자의 좋아요 기록을 분석하여 선호 카테고리에 가중치를 부여하고, 각 카테고리 내에서 레시피를 랜덤 추출하여 개인화된 추천 목록을 제공합니다.
* **무한 스크롤**: Intersection Observer를 활용하여 사용자 스크롤에 따라 자동으로 다음 페이지의 레시피를 불러와 끊김 없는 탐색 경험을 제공합니다.
* **로컬 스토리지 캐싱**: 첫 페이지 데이터를 로컬 스토리지에 저장하여 빠른 로딩 속도를 제공하고 서버 부하를 줄입니다.
* **비동기 통신**: Axios와 Spring WebFlux를 활용하여 벡엔드와 프론트엔드 간의 효율적인 비동기 통신을 구현했습니다.

## 팀 정보

* **개발**: 밥플 개발팀 (밥먹조)

**라이선스**

* 이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 `LICENSE` 파일을 참고하세요.

**밥플과 함께, 더 즐거운 요리 경험을 만들어보세요!** 
