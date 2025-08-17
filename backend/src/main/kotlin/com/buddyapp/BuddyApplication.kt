package com.buddyapp

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class BuddyApplication

fun main(args: Array<String>) {
    runApplication<BuddyApplication>(*args)
}
