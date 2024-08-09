package kr.bit.bobple.service;

import kr.bit.bobple.auth.AuthenticationFacade;
import kr.bit.bobple.dto.RecipeCommentDto;
import kr.bit.bobple.dto.RecipeDto;
import kr.bit.bobple.entity.LikeRecipe;
import kr.bit.bobple.entity.Recipe;
import kr.bit.bobple.entity.User;
import kr.bit.bobple.repository.LikeRecipeRepository;
import kr.bit.bobple.repository.RecipeCommentRepository;
import kr.bit.bobple.repository.RecipeRepository;
import kr.bit.bobple.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecipeService {

    private final UserRepository userRepository;
    private final RecipeRepository recipeRepository;
    private final HyperCLOVAClient hyperCLOVAClient;
    private final LikeRecipeRepository likeRecipeRepository;
    private final AuthenticationFacade authenticationFacade;
    private final RecipeCommentRepository recipeCommentRepository; // 추가: 댓글 레포지토리 의존성 주입
    private final RecipeImageService recipeImageService; // Inject the new service

    @Transactional(readOnly = true)
    public Optional<User> getUserWithRecipes(Long userId) {
        return userRepository.findUserWithRecipes(userId);
    }

    @Transactional(readOnly = true)
    public Page<RecipeDto> getAllRecipes(Pageable pageable) {
        return recipeRepository.findAll(pageable).map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public RecipeDto getRecipeById(Long recipeId) {
        Recipe recipe = recipeRepository.findRecipeWithUserById(recipeId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 레시피입니다."));

        // Increase views count outside of read-only transaction
        incrementViewsCount(recipe.getId());

        // 강제로 초기화
        Hibernate.initialize(recipe.getUser());

        return convertToDto(recipe); // 댓글 목록 포함하여 DTO 변환
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void incrementViewsCount(Long recipeId) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 레시피입니다."));
        recipe.setViewsCount(recipe.getViewsCount() + 1);
        recipeRepository.save(recipe);
    }

    @Transactional
    public RecipeDto createRecipe(RecipeDto recipeDto, MultipartFile imageFile) {
        User user = authenticationFacade.getCurrentUser(); // 현재 로그인된 사용자 정보 가져오기
        if (user == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }
        String imageUrl = recipeImageService.uploadRecipeImage(imageFile);
        Recipe recipe = recipeDto.toEntity(user);
        recipe.setPicture(imageUrl);

        // 좋아요 수, 조회수, 댓글 수 초기화
        recipe.setLikesCount(0);
        recipe.setViewsCount(0);
        recipe.setCommentsCount(0);

        return RecipeDto.fromEntity(recipeRepository.save(recipe));
    }

    @Transactional
    public RecipeDto updateRecipe(Long recipeId, RecipeDto recipeDto, MultipartFile imageFile) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 레시피입니다."));

        if (!isRecipeAuthor(recipeId, authenticationFacade.getCurrentUser())) {
            throw new IllegalArgumentException("작성자만 수정할 수 있습니다.");
        }
        String imageUrl = recipeImageService.uploadRecipeImage(imageFile);
        recipe.updateRecipe(recipeDto);
        recipe.setPicture(imageUrl);

        return RecipeDto.fromEntity(recipeRepository.save(recipe));
    }

    @Transactional
    public void deleteRecipe(Long recipeId) {
        if (!isRecipeAuthor(recipeId, authenticationFacade.getCurrentUser())) {
            throw new IllegalArgumentException("작성자만 삭제할 수 있습니다.");
        }
        recipeRepository.deleteById(recipeId);
    }

    public Page<RecipeDto> searchRecipes(String keyword, String category, int page, int size, String sort) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Order.desc("viewsCount"), Sort.Order.desc("likesCount")));
        if (sort.equals("viewsCount,desc")) {
            pageable = PageRequest.of(page, size, Sort.by(Sort.Order.desc("viewsCount")));
        }

        // If keyword and category are null or empty, find all recipes
        if ((keyword == null || keyword.isEmpty()) && (category == null || category.isEmpty())) {
            return recipeRepository.findAll(pageable).map(RecipeDto::fromEntity);
        }
        // If keyword is not null or empty and category is null or empty, find by keyword
        else if (keyword != null && !keyword.isEmpty() && (category == null || category.isEmpty())) {
            return recipeRepository.findByKeyword(keyword, pageable).map(RecipeDto::fromEntity);
        }
        // If keyword is null or empty and category is not null or empty, find by category
        else if ((keyword == null || keyword.isEmpty()) && category != null && !category.isEmpty()) {
            return recipeRepository.findByCategory(category, pageable).map(RecipeDto::fromEntity);
        }
        // If both keyword and category are not null or empty, find by both keyword and category
        else {
            return recipeRepository.findByKeywordAndCategory(keyword, category, pageable).map(RecipeDto::fromEntity);
        }
    }

    @Transactional(readOnly = true)
    public Page<Recipe> getLatestRecipes(Pageable pageable) {
        return recipeRepository.findAll(pageable);
    }

    // 유저 추천 레시피 목록 조회 (실제 추천 로직 구현)
    @Transactional(readOnly = true)
    public List<RecipeDto> getRecommendedRecipes(User user) {
        // TODO: 사용자 정보(user)를 기반으로 추천 레시피 목록 가져오기
        // 예시: 사용자의 좋아요, 조회수 등을 기반으로 추천 알고리즘 구현

        // 현재는 모든 레시피를 가져오는 예시 코드입니다.
        List<Recipe> recommendedRecipes = recipeRepository.findAll();
        return recommendedRecipes.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }


    @Transactional(readOnly = true)
    public List<RecipeDto> recommendRecipesByAI(String ingredients) {
        String prompt = "다음 재료들을 활용한 레시피를 추천해줘: " + ingredients;
        String response = hyperCLOVAClient.generateText(prompt);

        // 정규 표현식을 사용하여 레시피 정보 추출
        Pattern pattern = Pattern.compile("## (.*?)\n재료: (.*?)\n만드는 법:\n(.*?)(?=\n##|$)", Pattern.DOTALL);
        Matcher matcher = pattern.matcher(response);

        List<RecipeDto> recipeDtos = new ArrayList<>();
        while (matcher.find()) {
            RecipeDto recipeDto = new RecipeDto();
            recipeDto.setTitle(matcher.group(1));
            recipeDto.setIngredients(matcher.group(2));
            recipeDto.setInstructions(matcher.group(3));
            recipeDtos.add(recipeDto);
        }

        return recipeDtos;
    }

    public boolean isRecipeAuthor(Long recipeId, User user) {
        return recipeRepository.existsByIdAndUser(recipeId, user);
    }

    // recipe -> RecipeDto 변환 메서드
    private RecipeDto convertToDto(Recipe recipe) {
        RecipeDto recipeDto = RecipeDto.fromEntity(recipe);
        // 댓글 리스트 설정
        recipeDto.setComments(recipeCommentRepository.findByRecipeIdOrderByCreatedAtDesc(recipe.getId())
                .stream().map(RecipeCommentDto::fromEntity)
                .collect(Collectors.toList()));
        // 좋아요 여부 설정
        if (authenticationFacade.getCurrentUser() != null) {
            recipeDto.setLiked(likeRecipeRepository.existsByUser_UserIdxAndRecipe_Id(
                    authenticationFacade.getCurrentUser().getUserIdx(),
                    recipe.getId()
            ));
        }
        return recipeDto;
    }


    // 좋아요한 레시피 목록 조회 메서드
    @Transactional(readOnly = true)
    public List<RecipeDto> getLikedRecipes(Long userIdx) {
        User user = authenticationFacade.getCurrentUser();
        List<LikeRecipe> likedRecipes = likeRecipeRepository.findByUser(user);
        return likedRecipes.stream()
                .map(like -> RecipeDto.fromEntity(like.getRecipe()))
                .collect(Collectors.toList());
    }
}

