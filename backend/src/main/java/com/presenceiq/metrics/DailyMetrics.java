package com.presenceiq.metrics;

import com.presenceiq.user.User;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "daily_metrics")
public class DailyMetrics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;

    private int sleepHours;
    private int studyHours;
    private int stressLevel;
    private int exerciseMinutes;
    private int screenTimeMinutes;

    // ✅ NEW fields
    private int passiveScreenMinutes;
    private int activeLearningMinutes;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public DailyMetrics() {}

    // ---------------- GETTERS / SETTERS ----------------

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public int getSleepHours() {
        return sleepHours;
    }

    public void setSleepHours(int sleepHours) {
        this.sleepHours = sleepHours;
    }

    public int getStudyHours() {
        return studyHours;
    }

    public void setStudyHours(int studyHours) {
        this.studyHours = studyHours;
    }

    public int getStressLevel() {
        return stressLevel;
    }

    public void setStressLevel(int stressLevel) {
        this.stressLevel = stressLevel;
    }

    public int getExerciseMinutes() {
        return exerciseMinutes;
    }

    public void setExerciseMinutes(int exerciseMinutes) {
        this.exerciseMinutes = exerciseMinutes;
    }

    public int getScreenTimeMinutes() {
        return screenTimeMinutes;
    }

    public void setScreenTimeMinutes(int screenTimeMinutes) {
        this.screenTimeMinutes = screenTimeMinutes;
    }

    public int getPassiveScreenMinutes() {
        return passiveScreenMinutes;
    }

    public void setPassiveScreenMinutes(int passiveScreenMinutes) {
        this.passiveScreenMinutes = passiveScreenMinutes;
    }

    public int getActiveLearningMinutes() {
        return activeLearningMinutes;
    }

    public void setActiveLearningMinutes(int activeLearningMinutes) {
        this.activeLearningMinutes = activeLearningMinutes;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
