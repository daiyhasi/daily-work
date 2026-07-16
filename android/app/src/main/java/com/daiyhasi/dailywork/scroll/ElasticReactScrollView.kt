package com.daiyhasi.dailywork.scroll

import android.content.Context
import android.view.MotionEvent
import android.view.View
import androidx.dynamicanimation.animation.DynamicAnimation
import androidx.dynamicanimation.animation.SpringAnimation
import androidx.dynamicanimation.animation.SpringForce
import com.facebook.react.views.scroll.ReactScrollView
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

class ElasticReactScrollView(context: Context) : ReactScrollView(context) {
  private var lastTouchY = 0f
  private var springAnimation: SpringAnimation? = null
  private var touchActive = false
  private var activeFlingVelocity = 0
  private var flingEdgeHandled = false

  var elasticEnabled = true
  var maxOverscrollDistance = dpToPx(92f)
  var dragResistance = 0.42f
  var springStiffness = 520f
  var springDamping = 0.82f
  var flingVelocityMultiplier = 1.35f

  init {
    overScrollMode = View.OVER_SCROLL_NEVER
    setDecelerationRate(0.992f)
  }

  override fun onInterceptTouchEvent(event: MotionEvent): Boolean {
    if (event.actionMasked == MotionEvent.ACTION_DOWN) {
      springAnimation?.cancel()
      activeFlingVelocity = 0
      flingEdgeHandled = false
      touchActive = true
      lastTouchY = event.y
    }

    return super.onInterceptTouchEvent(event)
  }

  override fun onTouchEvent(event: MotionEvent): Boolean {
    when (event.actionMasked) {
      MotionEvent.ACTION_DOWN -> {
        springAnimation?.cancel()
        activeFlingVelocity = 0
        flingEdgeHandled = false
        touchActive = true
        lastTouchY = event.y
      }

      MotionEvent.ACTION_MOVE -> {
        val deltaY = event.y - lastTouchY
        lastTouchY = event.y

        if (elasticEnabled) {
          applyElasticDrag(deltaY)
        }
      }
    }

    val handled = super.onTouchEvent(event)

    when (event.actionMasked) {
      MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
        touchActive = false
        releaseContent()
      }
    }

    return handled
  }

  override fun fling(velocityY: Int) {
    activeFlingVelocity = (velocityY * flingVelocityMultiplier).roundToInt()
    flingEdgeHandled = false
    super.fling(activeFlingVelocity)
  }

  override fun onOverScrolled(
    scrollX: Int,
    scrollY: Int,
    clampedX: Boolean,
    clampedY: Boolean
  ) {
    super.onOverScrolled(scrollX, scrollY, clampedX, clampedY)

    if (!elasticEnabled || touchActive || !clampedY || flingEdgeHandled) {
      return
    }

    val velocity = abs(activeFlingVelocity)
    if (velocity < 450) {
      return
    }

    val content = getChildAt(0) ?: return
    val impulse = min(maxOverscrollDistance * 0.58f, dpToPx(14f) + velocity * 0.007f)
    content.translationY = if (scrollY <= 0) impulse else -impulse
    flingEdgeHandled = true
    activeFlingVelocity = 0
    releaseContent()
  }

  private fun applyElasticDrag(deltaY: Float) {
    val content = getChildAt(0) ?: return
    val translation = content.translationY
    val atTop = scrollY <= 0
    val atBottom = scrollY >= scrollRange
    val pullingPastTop = atTop && deltaY > 0f
    val pullingPastBottom = atBottom && deltaY < 0f

    if (translation == 0f && !pullingPastTop && !pullingPastBottom) {
      return
    }

    val movingTowardRest = translation != 0f && translation * deltaY < 0f
    val distanceRatio = (abs(translation) / maxOverscrollDistance).coerceIn(0f, 1f)
    val resistance = if (movingTowardRest) 1f else dragResistance * (1f - distanceRatio * 0.72f)
    var nextTranslation = translation + deltaY * resistance

    if (translation > 0f && nextTranslation < 0f || translation < 0f && nextTranslation > 0f) {
      nextTranslation = 0f
    }

    content.translationY = nextTranslation.coerceIn(-maxOverscrollDistance, maxOverscrollDistance)

    if (content.translationY > 0f && scrollY != 0) {
      scrollTo(scrollX, 0)
    } else if (content.translationY < 0f && scrollY != scrollRange) {
      scrollTo(scrollX, scrollRange)
    }
  }

  private fun releaseContent() {
    val content = getChildAt(0) ?: return
    if (content.translationY == 0f) {
      return
    }

    springAnimation?.cancel()
    springAnimation = SpringAnimation(content, DynamicAnimation.TRANSLATION_Y, 0f).apply {
      spring = SpringForce(0f).apply {
        stiffness = springStiffness
        dampingRatio = springDamping
      }
      setMinimumVisibleChange(0.5f)
      start()
    }
  }

  private val scrollRange: Int
    get() {
      val content = getChildAt(0) ?: return 0
      return max(0, content.height - (height - paddingTop - paddingBottom))
    }

  private fun dpToPx(value: Float): Float = value * resources.displayMetrics.density
}
