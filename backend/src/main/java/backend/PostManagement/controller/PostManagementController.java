package backend.PostManagement.controller;

import backend.exception.ResourceNotFoundException;
import backend.PostManagement.model.Comment;
import backend.Notification.model.NotificationModel;
import backend.PostManagement.model.PostManagementModel;
import backend.Notification.repository.NotificationRepository;
import backend.PostManagement.repository.PostManagementRepository;
import backend.User.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/posts")
public class PostManagementController {

    @Autowired
    private PostManagementRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Value("${media.upload.dir}")
    private String uploadDir;

    // Create a new post with media upload (1-3 files allowed)
    @PostMapping
    public ResponseEntity<?> createPost(
            @RequestParam String userID,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam String category,
            @RequestParam List<MultipartFile> mediaFiles) {

        // Validate number of uploaded files
        if (mediaFiles.size() < 1 || mediaFiles.size() > 3) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("You must upload between 1 and 3 media files.");
        }

        // Create upload directory if not exists
        final File uploadDirectory = new File(uploadDir.isBlank() ? uploadDir : System.getProperty("user.dir"), uploadDir);
        if (!uploadDirectory.exists() && !uploadDirectory.mkdirs()) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create upload directory.");
        }

        // Store media files and generate URLs
        List<String> mediaUrls = mediaFiles.stream()
                .filter(file -> file.getContentType().matches("image/(jpeg|png|jpg)|video/mp4"))
                .map(file -> {
                    try {
                        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
                        String uniqueFileName = System.currentTimeMillis() + "_" + UUID.randomUUID() + "." + extension;
                        Path filePath = uploadDirectory.toPath().resolve(uniqueFileName);
                        file.transferTo(filePath.toFile());
                        return "/media/" + uniqueFileName;
                    } catch (IOException e) {
                        throw new RuntimeException("Failed to store file " + file.getOriginalFilename(), e);
                    }
                })
                .collect(Collectors.toList());

        // Save post
        PostManagementModel post = new PostManagementModel();
        post.setUserID(userID);
        post.setTitle(title);
        post.setDescription(description);
        post.setCategory(category);
        post.setMedia(mediaUrls);

        PostManagementModel savedPost = postRepository.save(post);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPost);
    }

    // Get all posts
    @GetMapping
    public List<PostManagementModel> getAllPosts() {
        return postRepository.findAll();
    }

    // Get posts by a specific user
    @GetMapping("/user/{userID}")
    public List<PostManagementModel> getPostsByUser(@PathVariable String userID) {
        return postRepository.findAll().stream()
                .filter(post -> post.getUserID().equals(userID))
                .collect(Collectors.toList());
    }

    // Get a post by its ID
    @GetMapping("/{postId}")
    public ResponseEntity<?> getPostById(@PathVariable String postId) {
        PostManagementModel post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));
        return ResponseEntity.ok(post);
    }

    // Delete a post by ID (including media files)
    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable String postId) {
        PostManagementModel post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));

        // Delete associated media files
        for (String mediaUrl : post.getMedia()) {
            try {
                Path filePath = Paths.get(uploadDir, mediaUrl.replace("/media/", ""));
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to delete media file: " + mediaUrl);
            }
        }

        postRepository.deleteById(postId);
        return ResponseEntity.ok("Post deleted successfully!");
    }

    // Update post details and optionally add new media files
    @PutMapping("/{postId}")
    public ResponseEntity<?> updatePost(
            @PathVariable String postId,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam String category,
            @RequestParam(required = false) List<MultipartFile> newMediaFiles) {

        PostManagementModel post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));

        post.setTitle(title);
        post.setDescription(description);
        post.setCategory(category);

        if (newMediaFiles != null && !newMediaFiles.isEmpty()) {
            final File uploadDirectory = new File(uploadDir.isBlank() ? uploadDir : System.getProperty("user.dir"), uploadDir);
            if (!uploadDirectory.exists() && !uploadDirectory.mkdirs()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create upload directory.");
            }

            List<String> newMediaUrls = newMediaFiles.stream()
                    .map(file -> {
                        try {
                            String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
                            String uniqueFileName = System.currentTimeMillis() + "_" + UUID.randomUUID() + "." + extension;
                            Path filePath = uploadDirectory.toPath().resolve(uniqueFileName);
                            file.transferTo(filePath.toFile());
                            return "/media/" + uniqueFileName;
                        } catch (IOException e) {
                            throw new RuntimeException("Failed to store file " + file.getOriginalFilename(), e);
                        }
                    })
                    .collect(Collectors.toList());
            post.getMedia().addAll(newMediaUrls);
        }

        postRepository.save(post);
        return ResponseEntity.ok("Post updated successfully!");
    }

    // Delete a specific media file from a post
    @DeleteMapping("/{postId}/media")
    public ResponseEntity<?> deleteMedia(@PathVariable String postId, @RequestBody Map<String, String> request) {
        String mediaUrl = request.get("mediaUrl");

        PostManagementModel post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));

        if (!post.getMedia().remove(mediaUrl)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Media file not found in post.");
        }

        try {
            Path filePath = Paths.get(uploadDir, mediaUrl.replace("/media/", ""));
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete media file.");
        }

        postRepository.save(post);
        return ResponseEntity.ok("Media file deleted successfully!");
    }

    // Like or unlike a post
    @PutMapping("/{postId}/like")
    public ResponseEntity<PostManagementModel> likePost(@PathVariable String postId, @RequestParam String userID) {
        return postRepository.findById(postId)
                .map(post -> {
                    // Toggle like status
                    post.getLikes().put(userID, !post.getLikes().getOrDefault(userID, false));
                    postRepository.save(post);

                    // Send notification if user is not liking their own post
                    if (!userID.equals(post.getUserID())) {
                        String userFullName = userRepository.findById(userID)
                                .map(user -> user.getFullname())
                                .orElse("Someone");
                        String message = String.format("%s liked your %s post", userFullName, post.getTitle());
                        String currentDateTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                        NotificationModel notification = new NotificationModel(post.getUserID(), message, false, currentDateTime);
                        notificationRepository.save(notification);
                    }

                    return ResponseEntity.ok(post);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // Add a comment to a post
    @PostMapping("/{postId}/comment")
    public ResponseEntity<PostManagementModel> addComment(@PathVariable String postId, @RequestBody Map<String, String> request) {
        String userID = request.get("userID");
        String content = request.get("content");

        return postRepository.findById(postId)
                .map(post -> {
                    Comment comment = new Comment();
                    comment.setId(UUID.randomUUID().toString());
                    comment.setUserID(userID);
                    comment.setContent(content);

                    String userFullName = userRepository.findById(userID)
                            .map(user -> user.getFullname())
                            .orElse("Anonymous");
                    comment.setUserFullName(userFullName);

                    post.getComments().add(comment);
                    postRepository.save(post);

                    // Notify post owner about the new comment
                    if (!userID.equals(post.getUserID())) {
                        String message = String.format("%s commented on your post: %s", userFullName, post.getTitle());
                        String currentDateTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                        NotificationModel notification = new NotificationModel(post.getUserID(), message, false, currentDateTime);
                        notificationRepository.save(notification);
                    }

                    return ResponseEntity.ok(post);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // Update a comment
    @PutMapping("/{postId}/comment/{commentId}")
    public ResponseEntity<PostManagementModel> updateComment(
            @PathVariable String postId,
            @PathVariable String commentId,
            @RequestBody Map<String, String> request) {
        String userID = request.get("userID");
        String content = request.get("content");

        return postRepository.findById(postId)
                .map(post -> {
                    post.getComments().stream()
                            .filter(comment -> comment.getId().equals(commentId) && comment.getUserID().equals(userID))
                            .findFirst()
                            .ifPresent(comment -> comment.setContent(content));
                    postRepository.save(post);
                    return ResponseEntity.ok(post);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // Delete a comment (allowed by comment owner or post owner)
    @DeleteMapping("/{postId}/comment/{commentId}")
    public ResponseEntity<PostManagementModel> deleteComment(
            @PathVariable String postId,
            @PathVariable String commentId,
            @RequestParam String userID) {
        return postRepository.findById(postId)
                .map(post -> {
                    post.getComments().removeIf(comment ->
                            comment.getId().equals(commentId) &&
                                    (comment.getUserID().equals(userID) || post.getUserID().equals(userID)));
                    postRepository.save(post);
                    return ResponseEntity.ok(post);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // Handle file size limit exception
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<?> handleMaxSizeException(MaxUploadSizeExceededException exc) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body("File size exceeds the maximum limit!");
    }
}
