package com.buddyapp

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
open class BuddyApplication

fun main(args: Array<String>) {
    runApplication<BuddyApplication>(*args)
}
